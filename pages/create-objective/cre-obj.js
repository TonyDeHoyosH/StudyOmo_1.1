const input = document.getElementById('objective-name');
input.addEventListener('input', () => {
  if (input.value.length > 50) {
    alert('Máximo 50 caracteres');
    input.value = input.value.slice(0, 50);
  }
});