import { Pool } from 'pg';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Pool PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

interface Project {
  id: string;
  nom_projet: string;
  slug: string;
  date_creation: string;
  domaine?: string;
  informations_site?: string;
  audience_cible?: string;
  ton_redaction?: string;
  style_ecriture?: string;
  synthese_a_propos?: string;
  url_page_a_propos?: string;
  eeat_elements?: Array<{
    id?: string;
    titre: string;
    contenu: string;
  }>;
}

interface Redaction {
  id: string;
  id_projet: string;
  doc_id?: string;
  nom_article: string;
  mot_cle?: string;
  date_redaction: string;
  lien_google_doc?: string;
  statut?: string;
}

async function migrate() {
  console.log('🚀 Démarrage de la migration des données...\n');

  try {
    // Récupérer l'utilisateur unique
    const userResult = await pool.query('SELECT * FROM users LIMIT 1');
    if (!userResult.rows || userResult.rows.length === 0) {
      console.error('❌ Aucun utilisateur trouvé en base de données');
      console.log('💡 Assurez-vous que init.sql a bien été exécuté');
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log(`✅ Utilisateur trouvé: ${user.email}\n`);

    // ============================================
    // 1. MIGRER LES PROJETS
    // ============================================
    const projectsPath = join(__dirname, '../../data/projects.json');

    if (!existsSync(projectsPath)) {
      console.warn('⚠️  Fichier projects.json introuvable, skip');
    } else {
      const projectsJson: Project[] = JSON.parse(readFileSync(projectsPath, 'utf-8'));
      console.log(`📦 Migration de ${projectsJson.length} projet(s)...\n`);

      for (const project of projectsJson) {
        const { eeat_elements, ...projectData } = project;

        try {
          // Insérer le projet
          await pool.query(
            `INSERT INTO projects (
              id, user_id, nom_projet, slug, domaine,
              informations_site, audience_cible, ton_redaction,
              style_ecriture, synthese_a_propos, url_page_a_propos,
              date_creation, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
            ON CONFLICT (id) DO NOTHING`,
            [
              projectData.id,
              user.id,
              projectData.nom_projet,
              projectData.slug,
              projectData.domaine || null,
              projectData.informations_site || null,
              projectData.audience_cible || null,
              projectData.ton_redaction || null,
              projectData.style_ecriture || null,
              projectData.synthese_a_propos || null,
              projectData.url_page_a_propos || null,
              projectData.date_creation || new Date().toISOString()
            ]
          );

          console.log(`  ✅ Projet migré: ${projectData.nom_projet}`);

          // Insérer les éléments E-E-A-T
          if (eeat_elements && eeat_elements.length > 0) {
            for (const el of eeat_elements) {
              await pool.query(
                `INSERT INTO eeat_elements (project_id, titre, contenu)
                 VALUES ($1, $2, $3)`,
                [projectData.id, el.titre, el.contenu]
              );
            }
            console.log(`     → ${eeat_elements.length} élément(s) E-E-A-T ajouté(s)`);
          }
        } catch (error: any) {
          if (error.code === '23505') {
            console.log(`  ⚠️  Projet déjà existant: ${projectData.nom_projet}`);
          } else {
            console.error(`  ❌ Erreur pour ${projectData.nom_projet}:`, error.message);
          }
        }
      }
      console.log('');
    }

    // ============================================
    // 2. MIGRER LES RÉDACTIONS
    // ============================================
    const redactionsPath = join(__dirname, '../../data/redactions.json');

    if (!existsSync(redactionsPath)) {
      console.warn('⚠️  Fichier redactions.json introuvable, skip');
    } else {
      const redactionsJson: Redaction[] = JSON.parse(readFileSync(redactionsPath, 'utf-8'));
      console.log(`📦 Migration de ${redactionsJson.length} rédaction(s)...\n`);

      for (const redaction of redactionsJson) {
        try {
          await pool.query(
            `INSERT INTO redactions (
              id, project_id, doc_id, nom_article, mot_cle,
              date_redaction, lien_google_doc, statut, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            ON CONFLICT (id) DO NOTHING`,
            [
              redaction.id,
              redaction.id_projet,
              redaction.doc_id || null,
              redaction.nom_article,
              redaction.mot_cle || null,
              redaction.date_redaction || new Date().toISOString(),
              redaction.lien_google_doc || null,
              redaction.statut || 'en_cours'
            ]
          );

          console.log(`  ✅ Rédaction migrée: ${redaction.nom_article}`);
        } catch (error: any) {
          if (error.code === '23505') {
            console.log(`  ⚠️  Rédaction déjà existante: ${redaction.nom_article}`);
          } else {
            console.error(`  ❌ Erreur pour ${redaction.nom_article}:`, error.message);
          }
        }
      }
      console.log('');
    }

    // ============================================
    // 3. MIGRER LE BRIEF COURANT (si existe)
    // ============================================
    const briefPath = join(__dirname, '../../data/current-brief.json');

    if (existsSync(briefPath)) {
      try {
        const briefJson = JSON.parse(readFileSync(briefPath, 'utf-8'));

        await pool.query(
          `INSERT INTO current_briefs (project_id, title, content, doc_id, lien_google_doc, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (project_id) DO NOTHING`,
          [
            briefJson.id_projet || briefJson.project_id,
            briefJson.title,
            briefJson.content,
            briefJson.doc_id || null,
            briefJson.lien_google_doc || null
          ]
        );

        console.log('✅ Brief courant migré\n');
      } catch (error: any) {
        console.log('⚠️  Brief courant déjà existant ou erreur\n');
      }
    }

    // ============================================
    // STATISTIQUES FINALES
    // ============================================
    const statsProjects = await pool.query('SELECT COUNT(*) FROM projects');
    const statsRedactions = await pool.query('SELECT COUNT(*) FROM redactions');
    const statsEeat = await pool.query('SELECT COUNT(*) FROM eeat_elements');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Migration terminée avec succès !');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Statistiques finales:`);
    console.log(`   - Projets: ${statsProjects.rows[0].count}`);
    console.log(`   - Éléments E-E-A-T: ${statsEeat.rows[0].count}`);
    console.log(`   - Rédactions: ${statsRedactions.rows[0].count}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Exécuter la migration
migrate();
