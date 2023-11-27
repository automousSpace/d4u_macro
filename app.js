const express = require('express');
const cors = require('cors');
let randUserAgent = require("rand-user-agent");
var webSocketServer = require('websocket').server;
const cookieParser = require('cookie-parser');
const { Telegraf } = require("telegraf");
const bot = new Telegraf(
  "4"
);

var http = require('http');
const app = express();
var axios = require('axios');
app.set('view engine', 'ejs');
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer-core');
const puppeteerr = require('puppeteer-extra');
const GoLogin = require('./gologin');
const GoLoginopen = require('./openProfile');
var admin = require('firebase-admin');
var fire_db = admin.database();
const fs = require('fs');
const mysql = require('mysql');
const Mailjs = require("@cemalgnlts/mailjs");
const mailjs = new Mailjs();
const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));
var CronJob = require('cron').CronJob;
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')

const poolName = "/alphaToken";
const pathName = "E:/profiles";
let portno = 3512
let botTries = 0;
let autoBotStatus = false
let autoBotRuns = 0
let sitename = ''
let toolname = ''
let botChatID = ""

const util = require('util');
const query = util.promisify(db.query).bind(db);
var admin = require('firebase-admin');
const { del } = require('request');
var fire_db=admin.database();

puppeteerr.use(
  RecaptchaPlugin({
    provider: {
      id: '2captcha',
      token: '' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
    },
    visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
  })
)


const saveCookies =  async (cookiesForSave , email ) =>
{
  cookiesForSave = JSON.stringify(cookiesForSave)
  try { 
    await query(`UPDATE ahrefs_accounts SET cookies = '${cookiesForSave}'  where email = '${email}' and toolname = '${toolname}' and sitename = '${sitename}'`);
    console.log(" Cookies Saved  ------->")
     await addDataInMsgQueue(" Cookies Saved  ------->")

  } catch(err) {
    console.log(" Save Cookies Failed  ------->")
  }
}
const getAccount = () => {
  return new Promise(async (resolve, reject) => {
    try
    {
      let result = await query(`select *FROM ahrefs_accounts where sitename = '${sitename}' and toolname = '${toolname}' and active = 1 `);
      
      if(result.length > 0)
      {
        // active found
        // check for error on this acc
        let error = result[0].failed_account
        if(error == 0)
        {
          // return this used and healthy account
          return resolve([result[0].email , result[0].password , result[0].user_agent , result[0].proxy ])

        }
        else
        {
          // problem account found
          // change account // update active
          let result2 = await query(`select *FROM ahrefs_accounts where sitename = '${sitename}' and toolname = '${toolname}' and failed_account = '0'`);
          if(result2.length > 0)
          {
            // update old
            await query(`UPDATE ahrefs_accounts SET active = '' where id = '${result[0].id}'`);
            // update new
            await query(`UPDATE ahrefs_accounts SET active = '1' where id = '${result2[0].id}'`);
            return resolve([result2[0].email , result2[0].password , result2[0].user_agent , result2[0].proxy ])
            
          }
          else
          {
            // no account found
            // update old
            await query(`UPDATE ahrefs_accounts SET active = '' where id = '${result[0].id}'`);
            return reject('noaccount')
          }
        }

      }
      else
      {
        // active not found
        let result2 = await query(`select *FROM ahrefs_accounts where sitename = '${sitename}' and toolname = '${toolname}' and failed_account = '0'`);
        if(result2.length > 0)
        {
          // return login and pass // update active 
          await query(`UPDATE ahrefs_accounts SET active = '1' where id = '${result2[0].id}'`);
          return resolve([result2[0].email , result2[0].password , result2[0].user_agent , result2[0].proxy ])

        }
        else
        {
          // no account found
          return reject('noaccount')
        }
      }
    }
    catch(e)
    {

      console.log("error in getAhrefsAccount = " + e)
      return reject(e)

    }

  });
};
const updateError =  async (email ,error) =>
{
  try { 
    if(error == 'noError')
    await query(`UPDATE ahrefs_accounts SET error = '${error}', failed_account = '0' where email = '${email}'`);
    else
    await query(`UPDATE ahrefs_accounts SET error = '${error}', failed_account = '1' where email = '${email}'`);

    console.log(" Error Saved  ------->")
    // await addDataInMsgQueue(" Cookies Saved  ------->")

  } catch(err) {
    console.log(" Save Error Failed  ------->")
  }
}
const deleteMessagetm = async (msgid) =>
 {
  return new Promise (async(resolve, reject) => 
  {

    await mailjs.login("myahrefs1@exelica.com", "myahrefs")

    .then(async () =>
    {
        mailjs.deleteMessage(msgid)
        .then(async (output) =>
        {
          //  console.log(output)
            return resolve()
            
        })
            
    })
  })
}
const ahrefsScriptRestart = async () =>
 {
  return new Promise (async(resolve, reject) => 
  {
    try
    {
      axios.get('https://ahx.bundledseo.com/ahrefsScriptRestart').then(async (resp) => {
      //  console.log(resp.data);
      await addDataInMsgQueue(" Ahrefs Script Restarted")
      return resolve(true)
      });
    }
    catch(e)
    {
      console.log("Restart Failed")
      await addDataInMsgQueue(" Ahrefs Script Restart Failed")
      return resolve(true)
    }
  })
}
const checkToolLogin = async () =>
 {
  return new Promise (async(resolve, reject) => 
  {
    try
    {
      await axios.post('https://ahx.bundledseo.com/v4/asGetWorkspaces', 'null', {
    headers: {
      'Content-Type': 'application/json'
        }
      }).then(async (resp) => 
      {
        try
        {
          if(resp.data.workspaces[0].name)
          {
              console.log("Login Success");
              await addDataInMsgQueue(" Tool Login Successful")
              return resolve(true)
          }
        }
        catch(e)
        {
          console.log("Login Failed");
          await addDataInMsgQueue(" Tool Login Failed")
          return resolve(false)
        }
          
      }).catch(async function (error) {
        console.log(error);
        console.log(" Script Not Responding")
        await addDataInMsgQueue(" Checking Login... Script Not Responding") 
        return resolve(false)
      });
    }
    catch(e)
    {
      console.log(" Script Not Responding")
      await addDataInMsgQueue(" Checking Login... Script Not Responding")
      return resolve(true)
    }
  })
}
const opener = async (id, email, pass , useragent , proxy ) => {
  return new Promise(async (resolve, reject) => {

    try {
      // delete from tries and fail queue ...
      // existing interrupt 

      console.log(" Email : " + email)
      console.log(" Password : " + pass)
   //   console.log(" UserAgent : " + useragent)
      console.log(" Proxy : " + proxy)

      await addDataInMsgQueue(" - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  \n" )
      await addDataInMsgQueue(" Bot Activated");
      await addDataInMsgQueue(" Email : " + email)
      await addDataInMsgQueue(" Password : " + pass)
    //  await addDataInMsgQueue(" UserAgent : " + useragent)
      await addDataInMsgQueue(" Proxy : " + proxy)

      let host = ''
      let port = ''
      let proxyuser = ''
      let proxypass = ''
      if(proxy != 'null')
      {

        try
        {
          let tmp = proxy;
          tmp = tmp.split("@")
          
          let firstHalf = tmp[0]
          firstHalf = firstHalf.split("//")
          let mode = firstHalf[0]
          mode = mode.split(":")
          mode = mode[0]
          firstHalf = firstHalf[1]
          firstHalf = firstHalf.split(":")
          let secondHalf = tmp[1]
          secondHalf = secondHalf.split(":")
          host = secondHalf[0]
          port = secondHalf[1]
          proxyuser = firstHalf[0]
          proxypass = firstHalf[1]
        }
        catch(e)
        {
          await addDataInMsgQueue(" Error in Proxy String ")
          await updateError(email ,'PrxoyString' )
          return reject(e)
        }
      }
      else
      {
        proxy = ''
      }

      if(useragent == "null")
      useragent =''

      const myUseragent = randUserAgent("desktop");
      console.log("UserAgent : " + myUseragent)
      await addDataInMsgQueue(" UserAgent : " + useragent)
      
      const GL = new GoLoginopen({
        token: "token",
        profile_id: id,
        toolname : 'ahrefs',
        useragent : useragent,
        extra_params: [
          '--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
          '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end --window-size=500,500 ',
          (useragent.length>0)?`--user-agent=${useragent}`:'',
      //   (proxy.length>0)?`--proxy-server=http://${host}:${port}`:'',
      //   '--load-extension=C:/Users/Administrator/AppData/Local/Google/Chrome/User Data/Default/Extensions/mpbjkejclgfgadiemmefgebjfooflfhl/2.0.1_0',
       //   `--proxy-server=${newProxyUrl}` ,
        //   '--headless', '--no-sandbox'
        ]
      });

      const { status, wsUrl } = await GL.start().catch((e) => {
        console.trace(e);
        return { status: 'failure' };
      });

      if (status !== 'success') {
        console.log('Invalid status');
        return;
      }

      
      const browser = await puppeteerr.connect({
        browserWSEndpoint: wsUrl.toString(),
        ignoreHTTPSErrors: true,
        defaultViewport: null,
        args: [
          '--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
          '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end  --window-size=200,200',
        
        ]
      });

     try
     {
        var page = await browser.newPage();
        const viewPort = GL.getViewPort();
        viewPort.width =1024
        viewPort.height =768

    //   await page.setViewport({ width: 1024, height: 768 });
        const session = await page.target().createCDPSession();
        const { windowId } = await session.send('Browser.getWindowForTarget');
        await session.send('Browser.setWindowBounds', { windowId, bounds: viewPort });
        await session.detach();
        await page.setDefaultNavigationTimeout(60000);
        await page.setDefaultTimeout(60000);

    
        if(proxy.length > 0)
        {
        await page.authenticate({
          username: proxyuser,
          password: proxypass,
          });
        }


 
        try
        {
		        await page.goto('https://id.freepikcompany.com/v2/log-in?client_id=freepik&lang=en');
            // clear cookies
            const client = await page.target().createCDPSession();
            await client.send('Network.clearBrowserCookies');
            await client.send('Network.clearBrowserCache');
            await page.goto('https://id.freepikcompany.com/v2/log-in?client_id=freepik&lang=en');
			      await addDataInMsgQueue(` ${toolname} Page Opened`)
            console.log(" Page Opened..")
            let tries = 0
            let body_tries = 0
            let repeat_tries = 0
            while(true)
            {
              await delay(6000)
              let body = await page.evaluate(() => document.querySelector('body').innerText);
              //console.log(body);
              
              
              if(body)
              {
                body_tries--;
                tries++;

                //login error
                if(body.includes("The email or password you entered doesn't match our records"))
                {
                  try
                  {
                    tries--
                    console.log(" Incorrect email or password")
                    await addDataInMsgQueue(" Incorrect email or password")
                    await addDataInMsgQueue(" Bot Stopped")
                    await browser.close();
                    await updateError(email ,'incorrectDetails' )
                    bot.telegram.sendMessage(`${botChatID}`, `${sitename} - ${toolname}, Incorrect email or password`)
                    return resolve('incorrectDetails');
              
          
                  }
                  catch(e)
                  {
                    
                  // console.log(" Account Login Successful")
          
                  }
                }
                if(body.includes("Pricing Plans") && body.includes("Pay annually and"))
                {
                  try
                  {
                    tries--
                    console.log(" Subscription Expired")
                    await addDataInMsgQueue(" Subscription Expired")
                    await addDataInMsgQueue(" Bot Stopped")
                    await browser.close();
                    await updateError(email ,'planExpired' )
                    bot.telegram.sendMessage(`${botChatID}`, `${sitename} - ${toolname}, Subscription Expired`)
                    return resolve('planExpired');
              
          
                  }
                  catch(e)
                  {
                    
                  // console.log(" Account Login Successful")
          
                  }
                }
                
                // normal functions
                if(body.includes("Continue with email") && body.includes("Log in"))
                {
                  try
                  {
                    tries--
                    repeat_tries++
                    await page.waitForSelector('button[class="main-button button button--outline button--with-icon"]')
                    const [button] = await page.$x("//button[contains(., 'Continue with email')]");
                    if (button) 
                    {
                      await button.click();
                      console.log(" Continue with email Clicked..")
                      await delay(2000)
                    }

                    if(repeat_tries > 3)
                    {
                      await addDataInMsgQueue(" Repeat Tries Found")
                      await addDataInMsgQueue(" Bot Stopped")
                      await updateError(email ,'repeatTries' )
                      await browser.close();
                      return resolve('repeatTries');
                    }
              
                  }
                  catch(e)
                  {
                    
                  //   console.log(e)
              
                  }
                }
                if(body.includes("Welcome back!") && body.includes("Not you?"))
                {
                  try
                  {
                    tries--
                    repeat_tries++
                    await page.waitForSelector('button[class="button--no-style span--link"]')
                    const [button] = await page.$x("//button[contains(., 'Use another account')]");
                    if (button) 
                    {
                      await button.click();
                      console.log(" use another Clicked..")
                      await delay(2000)
                      continue
                    }

                    if(repeat_tries > 3)
                    {
                      await addDataInMsgQueue(" Repeat Tries Found")
                      await addDataInMsgQueue(" Bot Stopped")
                      await updateError(email ,'repeatTries' )
                      await browser.close();
                      return resolve('repeatTries');
                    }
              
                  }
                  catch(e)
                  {
                    
                  //   console.log(e)
              
                  }
                }
                if(body.includes("Don’t you have an account?") && body.includes("Log in"))
                {
                  try
                  {
                    tries--
                    repeat_tries++
                    await page.waitForSelector('input[name="email"]' , { timeout: 10000 });
                    await page.click('input[name="email"]');
                    await page.type('input[name="email"]', email);
                    console.log(" Email Entered..")
                    await addDataInMsgQueue(" Email Entered")
              
                    await page.waitForSelector('input[name="password"]');
                    await page.click('input[name="password"]');
                    await page.type('input[name="password"]', pass);
                    console.log(" Password Entered..")
                    await addDataInMsgQueue(" Password Entered")
              
                    await page.waitForSelector('button[type="submit"]')
                    trailbtn = await page.$('button[type="submit"]');
                    await trailbtn.evaluate(b => b.click());
                    console.log(" Login Clicked..")
                    await addDataInMsgQueue(" Login Clicked")
                    await delay(5000)
                    await addDataInMsgQueue(" Solving Captcha")
                    console.log(" Solving Captcha")
                    await page.solveRecaptchas()
                    await addDataInMsgQueue(" Captcha Solved..")
                    console.log(" Captcha Solved ...")
                    // const isCaptcha = await page.evaluate(() => {
                    //   const element = document.querySelector('iframe[title="recaptcha challenge expires in two minutes"]');
                    //   const style = getComputedStyle(element);
                    //   if(style.visibility == 'hidden')
                    //   return false
                    //   if(style.visibility == 'visible')
                    //   return true
                    // });

                    // if(isCaptcha)
                    // {
                    //   // const frameHandle1 = await page.waitForSelector('iframe[title="recaptcha challenge expires in two minutes"]');
                    //   // const frame1 = await frameHandle1.contentFrame();  
                      
                    //   console.log(" Captcha found")
                    //   await page.solveRecaptchas()
                    //   console.log(" Captcha Solved ...")

                    // }
                    // else
                    // {
                    //   console.log(" Captcha not found ...")
                    // }

                  

            

                    if(repeat_tries > 3)
                    {
                      await addDataInMsgQueue(" Repeat Tries Found")
                      await addDataInMsgQueue(" Bot Stopped")
                      await browser.close();
                      return resolve('repeatTries');
                    }
              
                  }
                  catch(e)
                  {
                    
                    console.log(e)
              
                  }
                }
                if(body.includes("Trending collections to boost your ideas"))
                {
                  try
                  {
                    tries--
                 //   await delay(20000000)
                    await page.waitForSelector('div[id="notification-center-menu-trigger"]' , { timeout: 10000 });
                    console.log(" Account Login Successful")
                    await addDataInMsgQueue(" Account Login Successful")
                    await updateError(email ,'noError' )
                    const cookies = await page.cookies()
                    console.log(cookies.length)
                    for (let i = 0; i < cookies.length; i++) 
                    {
                      if(cookies[i].name == "filters-configs")
                      {
                        cookies.splice(i, 1);
                        console.log('filters-configs found')
                      }
                      
                    }
                    console.log(cookies.length)
                    await saveCookies(cookies , email)
                    await browser.close();
              
                    bot.telegram.sendMessage(`${botChatID}`, `${sitename} - ${toolname}, Updated Successfull`)
                    await addDataInMsgQueue(" Bot Stopped")
                    return resolve("success");
              
                    
              
                  }
                  catch(e)
                  {
                    
                    console.log("error : " + e)
                    await addDataInMsgQueue(" Account Login Failed")
                    
              
                  }
                }

                if(tries > 3)
                {
                  await addDataInMsgQueue(" New Case Found")
                  await addDataInMsgQueue(" Bot Stopped")
                  await browser.close();
                  return reject('newCaseFound');
                // return resolve('newCaseFound');
                }
                

              }
              else
              {
                  body_tries++
                  if( body_tries == 2)
                  {
                    console.log(" body tries 2")
                    await page.reload()
                  }
                  if(body_tries > 3)
                  {
                      await addDataInMsgQueue(" No Body Found")
                      await addDataInMsgQueue(" Bot Stopped")
                      await browser.close();
                      return reject('noBodyFound');
                  // return resolve('newCaseFound');
                  }
              }
            }
        }
        catch(e)
        {
          console.log(e)
          await addDataInMsgQueue(e)
          return reject(false);
        }


     }
     catch(e)
     {
        console.log(e)
     }
      

    }
    catch (e) {
      console.log(" error in opener === " + e)
      await addDataInMsgQueue(" error in opener = "+ e);
      bot.telegram.sendMessage(`${botChatID}`, toolname + ", error in opener = "+ e)

      return reject(e)
    }
  });
};
const ProfileOpener = async (id , email, pass , useragent , proxy ) => {
  try
  {
    await opener( id, email , pass ,  useragent , proxy )
    
  }
  catch(e)
  {
  
    console.log("Rejected in Opener " + e)
    botTries++;
    if(botTries < 3)
    {

      await addDataInMsgQueue(" New Case Found -- Trying Again")
      await ProfileOpener( id, email , pass ,  useragent , proxy )
      return
    }
    else
    {
      await addDataInMsgQueue(" Failed after 3 tries")
      await addDataInMsgQueue(" Bot Stopped")
      await updateError(email ,'newCaseFound' )
      return
    }
    
  }

}
const AutobotOpener = async () => {
  try
  {
    let id = '64f457be556d286b2c6bee5c'
    let [email , pass , useragent , proxy ] = await getAccount() 
    await opener( id, email , pass ,  useragent , proxy )
    
  }
  catch(e)
  {
  

    console.log("Rejected in Opener " + e)
    botTries++;

    if(e == 'noaccount')
    {
      await addDataInMsgQueue(" No healthy account found")
      bot.telegram.sendMessage(`${botChatID}`, `${sitename} - ${toolname}, No healthy account found`)
      await addDataInMsgQueue(" Bot Stopped")
      return
    }

    if(botTries < 3)
    {

      await addDataInMsgQueue(" New Case Found -- Trying Again")
      await AutobotOpener()
      return
    }
    else
    {
      await addDataInMsgQueue(" Failed after 3 tries")
      await addDataInMsgQueue(" Bot Stopped")
      bot.telegram.sendMessage(`${botChatID}`, `${sitename} - ${toolname}, New Case found`)
      await updateError(email ,'newCaseFound' )
      return
    }
    
  }

}
const connectToDB = () => {
  return new Promise((resolve, reject) => {
    db.connect(function (err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(true);
    });
  });
}

// Websockets Logs
let msgQueue = []
let oldMsgQueue = []
var addDataInMsgQueue =  async (data) =>
{
  if(msgQueue.length > 50)
  {
    oldMsgQueue.splice(0, 1);
    msgQueue.splice(0, 1);
  }
  
  msgQueue.push(data)
}
var getDatafromMsgQueue =  async () =>
{
  let msg = []
  if(msgQueue.length > 0 && msgQueue.length > oldMsgQueue.length )
  {
    for (let i = oldMsgQueue.length; i < msgQueue.length; i++) 
    {
      msg.push(msgQueue[i])
    }
    oldMsgQueue = []
    for (let i = 0; i < msgQueue.length; i++) 
    {
       oldMsgQueue.push(msgQueue[i])
    }
    return msg

  }
  else
  return false
}

// Requests
app.get("/botRestart" , async (req, res) => {
  try 
  {
   
      res.json({ success: true, data: ['Restart Success'] });
      process.exit(1);
  } 
  catch(e) 
  {
    res.json({ success: true, data: "Error" });
    console.log(" get balance error = "+ e)
  }
});
app.get("/getOldLogs" , async (req, res) => {
  try 
  {
    if(msgQueue.length == 0)
      res.json({ success: true, data: [' No old log found'] });
      else
      res.json({ success: true, data: msgQueue });
      return
  } 
  catch(e) 
  {
    res.json({ success: true, data: "Error" });
    console.log(" get balance error = "+ e)
  }
});
app.get("/getNewLogs" , async (req, res) => {
  try 
  {
  
    let data = await getDatafromMsgQueue()
    if(data)
    {
      res.json({ success: true, data: data });
    }
    else
    {
      res.json({ success: false, data:'null' });
    }
    
  } 
  catch(e) 
  {
    res.json({ success: true, data: "Error" });
    console.log(" get balance error = "+ e)
  }
});
app.get("/botStatus", async (req, res) => {
  try 
  {
    res.json({ success: true})
    
  } 
  catch(e) 
  {
    res.json({ success: false});
  }
});
app.post("/updateDesire",  bodyParser.json({ strict: false }), async (req, res) => {
  try 
  {
    let id = '64f457be556d286b2c6bee5c'
    let email = req.body.email
    let pass = req.body.password
    let useragent = req.body.useragent
    let proxy = req.body.proxy
    ProfileOpener(id , email,pass, useragent , proxy )
   // AutobotOpener()
    res.json({ success: true})
    return
    
  } 
  catch(e) 
  {
    res.json({ success: false});
    return
  }
});
app.get("/autoBotOn", async (req, res) => {
  try 
  {
    autoBotStatus = true
    console.log(" Autbot Actived")
    bot.telegram.sendMessage(`${botChatID}`, toolname + ", Autobot Actived")
    var job = new CronJob(
      '0 */1 * * *',
      function() {
        autoBotRuns++
        bot.telegram.sendMessage(`${botChatID}`, toolname + ", Autobot Triggered")
        AutobotOpener()
      },
      null,
      true,
      'America/Los_Angeles'
    );
    res.json({ success: true})
    
  } 
  catch(e) 
  {
    res.json({ success: false});
    console.log(e)
  }
});
app.get("/autoBotStatus", async (req, res) => {
  try 
  {
    res.json({ success: autoBotStatus})
    
  } 
  catch(e) 
  {
    res.json({ success: false});
  }
});
app.get("/autoBotCounts", async (req, res) => {
  try 
  {
    res.json({ success: true, counts : autoBotRuns})
    
  } 
  catch(e) 
  {
    res.json({ success: false});
  }
});


app.listen(portno, async (err) => {
  if (err) {
    console.log(err);
    return;
  }
  await connectToDB()
  console.log("Server running on: http://127.0.0.1:"+portno);

});

