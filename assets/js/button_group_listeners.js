function setupButtonGroupListeners(groupId) {
  const buttonGroup = document.getElementById(groupId);
  const buttons = buttonGroup.querySelectorAll('a.button'); 

  buttons.forEach(button => {
      button.addEventListener('click', function(event) {
          event.preventDefault();
          buttons.forEach(btn => btn.classList.remove('primary'));
          this.classList.add('primary');
      });
  });
}