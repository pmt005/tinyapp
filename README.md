# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product


![An example user's url page](https://github.com/pmt005/tinyapp/blob/master/docs/User-Index.png?raw=true)(#)


![An example user's short url page](https://github.com/pmt005/tinyapp/blob/master/docs/%20User-shortUrl.png?raw=true)(#)



## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Functions
- user registration
- user login/logout with email and password
- create new shortUrls for existing longUrls
- view/edit/delete the user's own existing shortUrls
- view others short Urls via the  urls/:id path
  however you cannot edit these urls

## Security
- cookies are encrypted
- passwords are hashed

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.