/**
 * Retourne le titre et le seed de l'avatar en fonction du niveau de l'utilisateur.
 * 
 * @param {number} level - Le niveau de l'utilisateur
 * @returns {{title: string, seed: string}} - L'objet contenant le titre et le seed
 */
export const getUserRank = (level) => {
  if (level >= 20) {
    return { title: 'Maître Légendaire 👑', pokemonId: 130 }; // Gyarados
  } else if (level >= 5) {
    return { title: 'Dresseur de Révisions 🔥', pokemonId: 5 }; // Charmeleon
  } else {
    return { title: 'Novice ✨', pokemonId: 129 }; // Magikarp
  }
};
