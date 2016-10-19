# thenamecreator
An app/api for generating random creature & location names

To run locally:

> goapp serve

...then go to localhost:8080  

To deploy:

> python ../go_appengine/appcfg.py update ../thenamecreator/ -A thenamecreator -V v1 --no_cookies

...this worked, but still waiting for an instance to appear for the new deploy
