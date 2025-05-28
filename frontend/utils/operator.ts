export const translate = (operator: string) => {
  if (operator == "==") return "Igual";
  if (operator == ">") return "Maior que";
  if (operator == "<") return "Menor que";
  if (operator == "!=") return "Diferente";
  if (operator == ">=") return "Maior que ou igual";
  if (operator == "<=") return "Menor que ou igual";
  return operator;
};
