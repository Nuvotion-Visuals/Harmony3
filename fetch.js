fetch(`http://localhost:5002/api/tts?text=this%20is%20the%20text%20I%20want%20you%20to%20speak&speaker_id=p364&style_wav=&language_id=`)
  .then(res => res.blob())
  .then((myBlob) => {
    console.log(myBlob)
  });