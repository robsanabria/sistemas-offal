export const WORD_POOL = [
  // General words
  "gato",
  "perro",
  "casa",
  "coche",
  // Movies
  "el padrino",
  "matrix",
  "avatar",
  // Artists
  "shakira",
  "madonna",
  "picasso",
];

/**
 * Returns a random word from the WORD_POOL.
 */
export const randomWord = () => {
  return WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
};

