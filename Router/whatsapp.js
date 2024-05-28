const wbm = require('wbm');

wbm.start().then(async () => {
    const phones = ['9840962405'];
    const message = 'Good Night.';
    await wbm.send(phones, message);
    await wbm.end();
}).catch(err => console.log(err));