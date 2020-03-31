import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

    // Init the Express application
    const app = express();

    // Set the network port
    const port = process.env.PORT || 8082;

    // Use the body parser middleware for post requests
    app.use(bodyParser.json());

    // GET /filteredimage?image_url={{URL}}
    // Endpoint to filter an image from a public url.
    // It validates the image_url query, calls filterImageFromURL(image_url) to filter the image,
    // sends the resulting file in the response and deletes any files on the server on finish of the response
    //
    // QUERY PARAMATERS
    //    image_url: URL of a publicly accessible image
    // RETURNS
    //   the filtered image file
    app.get("/filteredimage", async (req, res) => {
        // Inspired by: https://stackoverflow.com/a/3809435/8696290
        const urlRegex: RegExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

        const imageURL: string = req.query.image_url;

        // If the URL is valid
        if (imageURL && imageURL.match(urlRegex)) {
            const filteredImagePath: string = await filterImageFromURL(imageURL);
            res.sendFile(filteredImagePath, () => deleteLocalFiles([filteredImagePath]));
        } else {
            res.status(400).send("Wrong or undefined image URL.");
        }
    });

    // Root Endpoint
    // Displays a simple message to the user
    app.get("/", async (req, res) => {
        res.send("Hello there! Try our new /filteredimage endpoint.")
    });


    // Start the Server
    app.listen(port, () => {
        console.log(`server running http://localhost:${port}`);
        console.log(`press CTRL+C to stop server`);
    });
})();