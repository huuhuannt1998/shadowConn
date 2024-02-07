require('dotenv').config();
const path = require('path')
const express = require('express')
const cookieSession = require('cookie-session')
const logger = require('morgan')
const encodeUrl = require('encodeurl')
const SSE = require('express-sse')
const FileContextStore = require('@smartthings/file-context-store')
const SmartApp = require('@smartthings/smartapp')

const port = process.env.PORT || 3000
const appId = process.env.APP_ID
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const serverUrl = process.env.SERVER_URL || `https://${process.env.PROJECT_DOMAIN}.glitch.me`
const apiUrl = process.env.API_URL || 'https://api.smartthings.com'
const redirectUri =  `${serverUrl}/oauth/callback`
const scope = encodeUrl('r:locations:* r:devices:* x:devices:*');

const fs = require('fs').promises;

/*
 * Server-sent events. Used to update the status of devices on the web page from subscribed events
 */
const sse = new SSE()

/**
 * Stores access tokens and other properties for calling the SmartThings API. This implementation is a simple flat file
 * store that is for demo purposes not appropriate for production systems. Other context stores exist, including
 * DynamoDB and Firebase.
 */
const contextStore = new FileContextStore('data')

/*
 * Thew SmartApp. Provides an API for making REST calls to the SmartThings platform and
 * handles calls from the platform for subscribed events as well as the initial app registration challenge.
 */


// 0dc70a10-bda8-4d39-a1ee-67dc45e91595
const axios = require('axios');

// Your SmartThings API access token
const accessToken1 = '64988233-33ea-4dee-9e8a-d042a10ed6f9';
const accessToken2 = '0dc70a10-bda8-4d39-a1ee-67dc45e91595';

// The Device ID of the switch you want to control
// const deviceIdAccount2 = '744ff0b6-8eb8-4ba2-8be6-6fb83d1363a6'; // Replace with actual device ID

// The desired command (e.g., 'on' or 'off')
// const command = 'on'; // Change to 'off' to turn the switch off

// SmartThings API endpoint for sending commands to a device
// const endpoint = `https://api.smartthings.com/v1/devices/${deviceIdAccount2}/commands`;

//Automation rules

async function createSmartThingsRule() {
    try {
        const accessToken = '64988233-33ea-4dee-9e8a-d042a10ed6f9'; // Ensure you have a valid access token
        const ruleData = await fs.readFile('./automationRule.json', 'utf8');
        const ruleJson = JSON.parse(ruleData);

        const response = await axios.post('https://api.smartthings.com/v1/rules', ruleJson, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        // console.log('Rule created successfully:', response.data);
        return 'Rule created successfully';
    } catch (error) {
        // console.error('Error creating rule:', error.response ? error.response.data : error.message);
        throw new Error('Error creating rule');
    }
}

// Function to change the switch status
const updateDeviceInAccount1 = async (command, deviceId) => {
	try {
	  const response = await axios.post(`https://api.smartthings.com/v1/devices/${deviceId}/commands`, {
		commands: [{
		  component: 'main',
		  capability: 'switch',
		  command: command,
		}]
	  }, {
		headers: {
		  'Authorization': `Bearer ${accessToken1}`,
		  'Content-Type': 'application/json',
		},
	  });
  
	//   console.log('Status changed successfully 1:', response.data);
	} catch (error) {
	//   console.error('Error changing switch status:', error.response ? error.response.data : error.message);
	}
  };

// Function to change the switch status
const updateDeviceInAccount2 = async (command, deviceId) => {
  try {
    const response = await axios.post(`https://api.smartthings.com/v1/devices/${deviceId}/commands`, {
      commands: [{
        component: 'main',
        capability: 'switch',
        command: command,
      }]
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken2}`,
        'Content-Type': 'application/json',
      },
    });

    // console.log('Status changed successfully 2:', response.data);
  } catch (error) {
    // console.error('Error changing switch status:', error.response ? error.response.data : error.message);
  }
};

// Function to fetch the current status of a device
const fetchDeviceStatus = async (deviceId) => {
    try {
        const response = await axios.get(`https://api.smartthings.com/v1/devices/${deviceId}/status`, {
            headers: { 'Authorization': `Bearer 64988233-33ea-4dee-9e8a-d042a10ed6f9` }
        });
        // Access the value directly within the response structure
        return response.data.components.main.switch.switch.value;
    } catch (error) {
        console.error('Error fetching device status:', error.response ? error.response.data : error.message);
        return 'Error';
    }
}

const fetchDeviceStatus2 = (deviceId) => {
    try {
        const response = axios.get(`https://api.smartthings.com/v1/devices/${deviceId}/status`, {
            headers: { 'Authorization': `Bearer 64988233-33ea-4dee-9e8a-d042a10ed6f9` }
        });
        // Access the value directly within the response structure
        return response.data.components.main.switch.switch.value;
    } catch (error) {
        console.error('Error fetching device status:', error.response ? error.response.data : error.message);
        return 'Error';
    }
}

// Call the function to change the switch status

  
const apiApp = new SmartApp()
	.appId(appId)
	.clientId(clientId)
	.clientSecret(clientSecret)
	.contextStore(contextStore)
	.redirectUri(redirectUri)
	.enableEventLogging(2)
	.subscribedEventHandler('switchHandler', async (ctx, event) => {
		/* Device event handler. Current implementation only supports main component switches */
		if (event.componentId === 'main') {
			try {
				sse.send({
					deviceId: event.deviceId,
					switchState: event.value
				})
			} catch(e) {
				console.log(e.message)
			}
		}
		// console.log(`EVENT ${event.deviceId} ${event.componentId}.${event.capability}.${event.attribute}: ${event.value}`)
		// console.log("REAL DEVICE COMMAND:", event.value)
		// createSmartThingsRule();
		// let VirtualDevice1status = await fetchDeviceStatus();
		// console.log("VIRTUAL DEVICE STATUS: ", VirtualDevice1status);
		// updateDeviceInAccount2(VirtualDevice1status); // Update the device in account 2
	})

/*
 * Webserver setup
 */
const server = express()
server.set('views', path.join(__dirname, 'views'))
server.use(cookieSession({
	name: 'session',
	keys: ['key1', 'key2']
}))
server.set('view engine', 'ejs')
server.use(logger('dev'))
server.use(express.json())
server.use(express.urlencoded({extended: false}))
server.use(express.static(path.join(__dirname, 'public')))

// Needed to avoid flush error with express-sse and newer versions of Node
server.use(function (req, res, next) {
	res.flush = function () { /* Do nothing */ }
	next();
})

/*
 * Handles calls to the SmartApp from SmartThings, i.e. registration challenges and device events
 */
server.post('/', async (req, res) => {
	apiApp.handleHttpCallback(req, res);
})

/*
 * Main web page. Shows link to SmartThings if not authenticated and list of switch devices afterwards
 */
server.get('/',async (req, res) => {
	if (req.session.smartThings) {
		// Cookie found, display page with list of devices
		const data = req.session.smartThings
		res.render('devices', {
			installedAppId: data.installedAppId,
			locationName: data.locationName
		})
	}
	else {
		// No context cookie. Display link to authenticate with SmartThings
		res.render('index', {
			url: `${apiUrl}/oauth/authorize?client_id=${clientId}&scope=${scope}&response_type=code&redirect_uri=${redirectUri}`
		})
	}
})

/**
 * Returns view model data for the devices page
 */
server.get('/viewData', async (req, res) => {
	const data = req.session.smartThings

	// Read the context from DynamoDB so that API calls can be made
	const ctx = await apiApp.withContext(data.installedAppId)
	try {
		// Get the list of switch devices, which doesn't include the state of the switch
		const deviceList = await ctx.api.devices.list({capability: 'switch'})

		// Query for the state of each one
		const ops = deviceList.map(it => {
			return ctx.api.devices.getCapabilityStatus(it.deviceId, 'main', 'switch').then(state => {
				return {
					deviceId: it.deviceId,
					label: it.label,
					switchState: state.switch.value
				}
			})
		})

		// Wait for all those queries to complete
		const devices = await Promise.all(ops)

		// Respond to the request
		res.send({
			errorMessage: devices.length > 0 ? '' : 'No switch devices found in location',
			devices: devices.sort( (a, b) => {
				return a.label === b.label ? 0 : (a.label > b.label) ? 1 : -1
			})
		})
	} catch (error) {
		res.send({
			errorMessage: `${error.message || error}`,
			devices: []
		})
	}
});

/*
 * Logout. Uninstalls app and clears context cookie
 */
server.get('/logout', async function(req, res) {
	try {
		// Read the context from DynamoDB so that API calls can be made
		const ctx = await apiApp.withContext(req.session.smartThings.installedAppId)

		// Delete the installed app instance from SmartThings
		await ctx.api.installedApps.delete()
	}
	catch (error) {
		console.error('Error logging out', error.message)
	}
	// Delete the session data
	req.session = null
	res.redirect('/')

})

/*
 * Handles OAuth redirect
 */
server.get('/oauth/callback', async (req, res, next) => {

	try {
		// Store the SmartApp context including access and refresh tokens. Returns a context object for use in making
		// API calls to SmartThings
		const ctx = await apiApp.handleOAuthCallback(req)

		// Get the location name (for display on the web page)
		const location = await ctx.api.locations.get(ctx.locationId)

		// Set the cookie with the context, including the location ID and name
		req.session.smartThings = {
			locationId: ctx.locationId,
			locationName: location.name,
			installedAppId: ctx.installedAppId
		}

		// Remove any existing subscriptions and unsubscribe to device switch events
		await ctx.api.subscriptions.delete()
		await ctx.api.subscriptions.subscribeToCapability('switch', 'switch', 'switchHandler');

		// Redirect back to the main page
		res.redirect('/')
	} catch (error) {
		next(error)
	}
})

/**
 * Executes a device command from the web page
 */
server.post('/command/:deviceId', async(req, res, next) => {
	try {
		// Read the context from DynamoDB so that API calls can be made
		const ctx = await apiApp.withContext(req.session.smartThings.installedAppId)

		// Execute the device command
		await ctx.api.devices.executeCommands(req.params.deviceId, req.body.commands)
		res.send({})

		// console.log("req.params.deviceId: ", req.params.deviceId)
		// console.log("req.body.commands: ", req.body.commands[0].command)

		if (req.params.deviceId == 'a7940a66-f91c-4c51-a279-9d2a332fde91') { // Real device account 1
			let realDevicestatus = req.body.commands[0].command;
			// console.log("REAL DEVICE STATUS 1: ", realDevicestatus);
			updateDeviceInAccount1(realDevicestatus, "a27770da-f4f9-48de-95cf-82948916b7f3"); // Update the device in account 1
			let VirtualDevice1status = fetchDeviceStatus2("a27770da-f4f9-48de-95cf-82948916b7f3");
			// console.log("VIRTUAL DEVICE STATUS 2: ", VirtualDevice1status);
			updateDeviceInAccount2(realDevicestatus, "744ff0b6-8eb8-4ba2-8be6-6fb83d1363a6"); // Update the device in account 2
		}
		else if (req.params.deviceId == "a27770da-f4f9-48de-95cf-82948916b7f3") { // Virtual device account 1
			let VirtualDevice1status = await fetchDeviceStatus(req.params.deviceId);
			// console.log("VIRTUAL DEVICE STATUS 1: ", VirtualDevice1status);
			updateDeviceInAccount1(VirtualDevice1status, "a7940a66-f91c-4c51-a279-9d2a332fde91"); // Update the device in account 1
			let VirtualDevice1status2 = await fetchDeviceStatus("a27770da-f4f9-48de-95cf-82948916b7f3");
			// console.log("VIRTUAL DEVICE STATUS 2: ", VirtualDevice1status2);
			updateDeviceInAccount2(VirtualDevice1status2, "744ff0b6-8eb8-4ba2-8be6-6fb83d1363a6"); // Update the device in account 2
		}

		// let VirtualDevice1status = await fetchDeviceStatus("a27770da-f4f9-48de-95cf-82948916b7f3");
		// console.log("VIRTUAL DEVICE STATUS 2: ", VirtualDevice1status);
		// updateDeviceInAccount2(VirtualDevice1status, "744ff0b6-8eb8-4ba2-8be6-6fb83d1363a6"); // Update the device in account 2
	} catch (error) {
		next(error)
	}
});



/**
 * Executes a command for all devices
 */
server.post('/commands', async(req, res) => {
	// console.log(JSON.stringify(req.body.commands, null, 2))
	// Read the context from DynamoDB so that API calls can be made
	const ctx = await apiApp.withContext(req.session.smartThings.installedAppId)

	const devices = await ctx.api.devices.list({capability: 'switch'})
	const ops = []
	for (const device of devices) {
		ops.push(ctx.api.devices.executeCommands(device.deviceId, req.body.commands))
	}
	await Promise.all(ops)

	res.send({})
});

/**
 * Handle SSE connection from the web page
 */
server.get('/events', sse.init);

/**
 * Start the HTTP server and log URLs. Use the "open" URL for starting the OAuth process. Use the "callback"
 * URL in the API app definition using the SmartThings Developer Workspace.
 */
server.listen(port);
// console.log(`\nTarget URL -- Copy this value into the targetUrl field of you app creation request:\n${serverUrl}\n`);
// console.log(`Redirect URI -- Copy this value into redirectUris field of your app creation request:\n${redirectUri}\n`);
// console.log(`Website URL -- Visit this URL in your browser to log into SmartThings and connect your account:\n${serverUrl}`);



