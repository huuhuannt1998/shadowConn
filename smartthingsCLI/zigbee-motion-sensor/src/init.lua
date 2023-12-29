-- Load SmartThings modules
local capabilities = require "st.capabilities"
local Driver = require "st.driver"
local zigbee_handlers = require "st.zigbee".zigbee_handlers
local battery_utils = require "st.zigbee.defaults.battery_defaults"  
print("CP path: ", package.path)

local minReportingInterval = capabilities["instantforge19660.minreportinginterval"]
local maxReportingInterval = capabilities["instantforge19660.maxreportinginterval"]

local minInterValue = capabilities["instantforge19660.minreportinginterval"]
local maxInterValue = capabilities["instantforge19660.maxreportinginterval"]


print("Checkpoint 0")
print("minInterValue: ", minInterValue)
print("maxInterValue: ", maxInterValue)

-- Battery percentage table
local battery_table = {
  [2.80] = 100,
  [2.70] = 100,
  [2.60] = 100,
  [2.50] = 90,
  [2.40] = 90,
  [2.30] = 70,
  [2.20] = 70,
  [2.10] = 50,
  [2.00] = 50,
  [1.90] = 30,
  [1.80] = 30,
  [1.70] = 15,
  [1.60] = 1,
  [1.50] = 0
}

-- Custom capability definitions
local detectionMaxCapability = capabilities["stse.detectionMax"]
local detectionMinCapability = capabilities["stse.detectionMin"]


-- Handlers for min/max reporting interval capabilities
function handleMinInterval(driver, device, command)

  local newValue = command.args.value
  print("New value min:", newValue)
  device:emit_event(minReportingInterval.minInterval(newValue)) 

end

function handleMaxInterval(driver, device, command)

  local newValue = command.args.value
  print("New value max:", newValue)
  device:emit_event(maxReportingInterval.maxInterval(newValue)) 

end

-- Utility function to handle detection frequency change
local function handleDetectionFrequency(device, value, isMax)
  local attribute = isMax and detectionMaxCapability.attributes.detectionFrequency or detectionMinCapability.attributes.detectionFrequency
  device:emit_event(attribute({ value = value, unit = isMax and "max" or "min" }))
end


-- Handler for when a device is added to the SmartThings ecosystem
function device_added(driver, device)
  device:emit_event(minReportingInterval.minInterval(30)) 
  device:emit_event(maxReportingInterval.maxInterval(3600))
end

-- Handler for when a device is removed from the SmartThings ecosystem
local function device_removed(driver, device)
  print("Device removed: " .. device.id)
end

-- Handler for when a device is initialized
function device_init(driver, device)
  device:emit_event(minReportingInterval.minInterval(30))
  device:emit_event(maxReportingIntervalCapability.maxInterval(3600)) 
end

-- Handler for configuring the device - typically used for Zigbee or Z-Wave devices
local function device_doconfigure(driver, device)
  print("Configuring device: " .. device.id)
  -- Example for a Zigbee device: device:configure()
end



-- Driver Template
local driver_template = {
  zigbee_handlers = zigbee_handlers,
  lifecycle_handlers = {
    added = device_added,
    removed = device_removed,
    init = device_init,
    doConfigure = device_doconfigure,
  },
  capability_handlers = {

    [minReportingInterval.ID] = { 
       [minReportingInterval.commands.setMinInterval.NAME] = handleMinInterval
    },
  
    [maxReportingInterval.ID] = {
       [maxReportingInterval.commands.setMaxInterval.NAME] = handleMaxInterval 
    }
  
  }
}

-- Driver initialization
local driver = Driver("my_driver", driver_template)
driver:run()

