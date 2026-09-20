
const measuringSystemAndGeneralUnit = {
    "imperial": {
        "numeric": { value: "pcs", label: "pcs" },
        "big_mass": { value: "lb", label: "lb" },
        "small_mass": { value: "oz", label: "oz" },
        "big_volume": { value: "gal", label: "gal" },
        "small_volume": { value: "fl_oz", label: "fl oz" },
    },
    "metric": {
        "numeric": { value: "pcs", label: "pcs" },
        "big_mass": { value: "kg", label: "kg" },
        "small_mass": { value: "g", label: "g" },
        "big_volume": { value: "l", label: "L" },
        "small_volume": { value: "ml", label: "mL" },
    }
}



function getGeneralUnit(specificUnitLabel, measuringSystem) {
    if (!measuringSystem) measuringSystem = state.settings?.measuringSystem || "metric";

    const internalMap = measuringSystemAndGeneralUnit[measuringSystem];
    
    return Object.keys(internalMap)
        .find(key => internalMap[key].value === specificUnitLabel) || "numeric";
}


function getSpecificUnit(generalUnit, measuringSystem) {
        if (!measuringSystem) measuringSystem = state.settings?.measuringSystem || "metric";
        return measuringSystemAndGeneralUnit[measuringSystem]?.[generalUnit] || "pcs";
}

function getListOfSpecifcUnits(measuringSystem) {
    if (!measuringSystem) measuringSystem = state.settings?.measuringSystem || "metric";
    console.log(measuringSystemAndGeneralUnit[measuringSystem].values());
    return measuringSystemAndGeneralUnit[measuringSystem].values();
}