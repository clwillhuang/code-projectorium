const mongoose = require("mongoose");

module.exports = {
    connectMongoose: async (onError) => {
        try {
            mongoose.set('strictQuery', true);
            mongoose.Schema.Types.String.checkRequired(v => typeof v === 'string');
            await mongoose.connect(process.env.ATLAS_URI, {
                useNewUrlParser: true, useUnifiedTopology: true
            }, async () => {
                console.log("Successfully connected to MongoDB.");
            });
        } catch (err) {
            onError(err)
        }
    }
}

