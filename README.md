# H2O Crop
Efficient Irrigation System

#### How to install
1. Download nodejs 6.10.2
2. Download ionic `npm install ionic cordova`
3. Download repository from github
4. Run these commands on terminal
```
cd h2ocrop
rm -rf node_modules
npm rebuild
npm install
```
5. `ionic serve`

## Source Code Docs
| File		| Purpose	|
|:-------------:|:-------------:|
| server.js | all SQL queries, mails, and RESTful API calls |
| updateServer.js | collects daily data from the Hydroclimate Data Center. Also for setting up a new crop |
| dailyUpdateServer.js | calls updateServer.js daily |
| app/app.component.ts | sets root page. Also sets Side Menu pages' links. |
| app/app.module.ts | includes all pages used in the app |
| src/providers/auth-service.ts | Provides connection to RESTful API services |
| src/pages/*/* | All pages in the application |

#### Running program
[H2OCrop: Efficient Irrigation System](https://h2ocrop.herokuapp.com)
