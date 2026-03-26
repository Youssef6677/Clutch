# Instructions de Développement (Projet StudyQuest / RPG)

## Stack Technique
- **Frontend :** React (Vite) + Tailwind CSS
- **Backend/Database :** Supabase (PostgreSQL, Auth, RLS)
- **Langue :** Interface en Français.

## Règles de Code (Frontend)
- Utilise toujours des composants fonctionnels (Functional Components) et les Hooks React (`useState`, `useEffect`).
- Garde un design "Rétro RPG" : des bordures épaisses (`border-4 border-black`), des ombres dures (`shadow-[4px_4px_0px_rgba(0,0,0,1)]`), et des couleurs vives.
- Ne crée pas de sous-dossiers inutiles. Garde une structure plate dans `src/components` pour l'instant.

## Règles de Base de Données (Supabase)
- Nous utilisons l'architecture à 7 tables : `profiles`, `tasks`, `subjects`, `decks`, `flashcards`, `timetable`, `resources`.
- La clé primaire est TOUJOURS `id` (UUID généré par `gen_random_uuid()`).
- Toute table (sauf `profiles`) possède une clé étrangère `user_id` qui pointe vers `profiles(id)`.
- **Schéma Flashcards :** Un Deck (`decks`) possède un `name` et un `subject_id` obligatoire. Une Flashcard (`flashcards`) possède un `front` (question) et un `back` (réponse).
- **Schéma Ressources :** Les ressources sont liées à un `subject_id` et possèdent une `category` ('Cours', 'TD', 'Annales').
- **Ne propose jamais de requêtes SQL complexes dans le frontend.** Utilise toujours le SDK Supabase JS officiel (ex: `supabase.from('table').select('*')`).

## Règles Métier (Gamification)
- **Seuil de Niveau :** Utilise toujours une constante `XP_PER_LEVEL = 100`.
- **Gains d'XP :**
    - Validation d'une tâche : +10 XP.
    - Session Flashcards : +1 XP par carte unique (max 20 XP par session).
- **Attribution XP :** Toujours récupérer l'utilisateur via `supabase.auth.getUser()` avant une mise à jour de profil pour garantir la sécurité et la précision.

## Comportement de l'IA
- Ne modifie pas l'architecture de la base de données sans me demander l'autorisation.
- N'installe pas de nouvelles librairies `npm` sans m'expliquer pourquoi.
- Si une erreur survient, ne supprime pas tout le code : cherche d'abord à comprendre le bug et propose un correctif ciblé.