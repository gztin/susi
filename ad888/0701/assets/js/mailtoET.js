const btn = document.getElementById('button');

document.getElementById('form')
 .addEventListener('submit', function(event) {
   event.preventDefault();

   btn.value = 'Sending...';

   const serviceID = 'default_service';
   const templateID = 'template_35bauvd';

   emailjs.sendForm(serviceID, templateID, this)
    .then(() => {
      btn.value = '送出';
      alert('已送出');
    }, (err) => {
      btn.value = '送出';
      alert(JSON.stringify(err));
    });
});