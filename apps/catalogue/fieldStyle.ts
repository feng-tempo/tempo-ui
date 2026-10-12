/** Consumer-owned form decoration, matching SingleForm/TabForm geometry. */
export function fieldStyle(focused: boolean, error: boolean, highlightColour: string) {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(highlightColour);
  if (!match) throw new Error('The catalogue highlight colour must be a six-digit hex value');
  const rgb = match.slice(1).map(value => parseInt(value, 16)).join(', ');
  return {
    ...(error ? {borderColor: '#8b0000'} : {}),
    ...(focused ? {borderColor: highlightColour, boxShadow: `0 0 3px rgba(${rgb}, 0.7)`} : {}),
  };
}
