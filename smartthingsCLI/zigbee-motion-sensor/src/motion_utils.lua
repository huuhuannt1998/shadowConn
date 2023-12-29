-- local capabilities = require "st.capabilities"

local motion_utils = {}


local function get_pref_min(device)
  return device:get_field(device.preferences.minReportingInterval)
end

local function set_pref_min(device,value)
  device:set_field(device.preferences.minReportingInterval, value)
end

local function get_pref_max(device)
    return device:get_field(device.preferences.maxReportingInterval)
end
  
local function set_pref_max(device, value)
    device:set_field(device.preferences.maxReportingInterval, value)
end 

return motion_utils