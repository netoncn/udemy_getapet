const fs = require('fs');

const imageRemove = (folder, image) => {
    try {
        fs.unlinkSync(`public/images/${folder}/${image}`);
        console.log(`successfully deleted public/images/${folder}/${image}`);
    } catch (error) {
        console.error('there was an error:', error.message);
    }
}

module.exports = { imageRemove }