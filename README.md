# Zettel Module - Scheduler

Scheduler module lets others easily book your available meeting time. 

Features includes: 
- Put down available time slots.
- Book a time slot with name and email.  

It is created out of the [Zettel Extension Seed](https://github.com/zettelooo/zettel-extension-seed) project template.

---
The repository consists of three projects:

1. The `client` project, this is the main extension implementation which will be a part of the Web app itself.

   Here are the scripts to support that:

   - To update the Zettel official dependencies to their newest versions in order to access the latest API end-points and data models:

     ```sh
     client$ npm run update
     ```

   - To upgrade the extension version in `public/manifest.jsonc` file:

     ```sh
     client$ npm run version -- patch
     client$ npm run version -- minor
     client$ npm run version -- major
     ```

   - To build the extension and pack the zip file to be uploaded to [Zettel Developer Console](https://app.zettel.ooo/developer):
     ```sh
     client$ npm run build
     ```
     > **Note:** The built extension goes to the `client/out` folder.

   - Same as above, plus it also takes care of the upload part:
     ```sh
     client$ npm run deploy
     ```

1. The `server` project, which can only help by extensions that require their own server-side implementation.

   Here are the scripts to support that:

   - To update the Zettel official dependencies to their newest versions in order to access the latest API end-points and data models:

     ```sh
     server$ npm run update
     ```

   - To start the server:
     ```sh
     server$ npm run dev   # For development, with hot reloads
     server$ npm start     # For production
     ```
     > **Note:** You can specify on what port it will serve your API by prepending `PORT=4000` to the commands above, by default it uses the port `4000`.

1. The `shared` project, which contains the shared implementation between the two others.

   Here are the scripts to support that:

   - To update the Zettel official dependencies to their newest versions in order to access the latest API end-points and data models:

     ```sh
     shared$ npm run update
     ```

For more information, please [contact the development](mailto:ahs502@gmail.com) team.
