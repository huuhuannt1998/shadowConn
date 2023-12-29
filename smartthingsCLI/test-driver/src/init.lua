-- Copyright 2022 SmartThings
--
-- Licensed under the Apache License, Version 2.0 (the "License");
-- you may not use this file except in compliance with the License.
-- You may obtain a copy of the License at
--
--     http://www.apache.org/licenses/LICENSE-2.0
--
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS,
-- WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
-- See the License for the specific language governing permissions and
-- limitations under the License.

local battery_defaults = require "st.zigbee.defaults.battery_defaults"

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


-----------------------------------------------------------------
-- local functions
-----------------------------------------------------------------
-- this is called once a device is added by the cloud and synchronized down to the hub
local function device_added(driver, device)
	log.info("[" .. device.id .. "] Adding new YARA Project device")
  
	-- set a default or queried state for each capability attribute
	device:emit_event(capabilities.switch.switch.on())
  end
  
  -- this is called both when a device is added (but after `added`) and after a hub reboots.
  local function device_init(driver, device)
	log.info("[" .. device.id .. "] Initializing YARA Project device")
  
	-- mark device as online so it can be controlled from the app
	device:online()
  end
  
  -- this is called when a device is removed by the cloud and synchronized down to the hub
  local function device_removed(driver, device)
	log.info("[" .. device.id .. "] Removing YARA Project device")
  end

-- adding handler of hidden atrribute

local function handle_temp_offset(driver, device, command)
    local offset = command.args.value
    -- Store the offset in the device's state
    device:set_field("device.preferences.tempOffSet", offset, {persist = true})
    -- Optionally, trigger an update to recalculate temperature with new offset
    update_temperature(device)
end

local function report_temperature(device, raw_temperature)
    local offset = device:get_field("device.preferences.tempOffSet") or 0
    local adjusted_temperature = raw_temperature + offset
    -- Report the adjusted temperature
    device:emit_event(capabilities.temperatureMeasurement.temperature(adjusted_temperature))
end


local function init_handler(driver, device)
  battery_defaults.enable_battery_voltage_table(device, battery_table)
end

local smartthings_motion = {
  NAME = "SmartThings Motion Sensor",
  lifecycle_handlers = {
    init = init_handler
  },
  can_handle = function(opts, driver, device, ...)
    return device:get_manufacturer() == "SmartThings"
  end
}


-- registration for tempOffSet
local driver_template = {
    supported_capabilities = {
        -- Other capabilities
        capabilities["preferences.tempOffSet"] = {
            capability_handlers = {
                [capabilities["preferences.tempOffSet"].commands.setOffset.NAME] = handle_temp_offset
            }
        },
        -- Other capabilities
    },
    -- Other driver configuration
}

return smartthings_motion