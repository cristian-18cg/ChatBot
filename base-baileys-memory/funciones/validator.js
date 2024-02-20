function Regexpalabras(cadena) {
  const patron = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ ]+$/;
  return patron.test(cadena);
}
module.exports = Regexpalabras;
