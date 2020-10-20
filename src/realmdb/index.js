import Realm from 'realm'

const UserSchema = {
   
    name: "Messages",
    properties: 
    {
        raw_content: {type: 'string', optional: true},
        txrx: {type: 'string', optional: true},
        kind: {type: 'string', optional: true},
        message_body: {type: 'string', optional: true},
        success: {type: 'bool', optional: true},
        createdAt: {type: 'date', optional: true},
        reports: {type: 'list', objectType: 'Report'},
        ips: {type: 'list', objectType: 'IoPortStatus'},
        place: {type: 'Place', optional: true},
    }
    
}

const PlaceSchema = {
    name: "Place",
    properties:
    {
        report_number: {type: 'int', optional: true},
        lat: {type: 'double', optional: true},
        lng: {type: 'double', optional: true},
        utc: {type: 'date', optional: true},
        alt: {type: 'int', optional: true},
        speed: {type: 'int', optional: true},
        course: {type: 'int', optional: true},
        createdAt: {type: 'date', optional: true},


    }
}


const IoPortStatusSchema = {
    name: "IoPortStatus",
    properties:
    {
        port_num: {type: 'int', optional: true},
        io_status: {type: 'string', optional: true},
        out_status: {type: 'string', optional: true},
        ADC: {type: 'int', optional: true},
        createdAt: {type: 'date', optional: true},
    }
}

const ReportSchema = {
    name: "Report",
    properties:
    {
        report_num: {type: 'int', optional: true},
        enable: {type: 'bool', optional: true},
        utc_on: {type: 'bool', optional: true},
        gps_on: {type: 'bool', optional: true},
        alt_on: {type: 'bool', optional: true},
        speed_on: {type: 'bool', optional: true},
        course_on: {type: 'bool', optional: true},
        period_time: {type: 'int', optional: true},
        createdAt: {type: 'date', optional: true},
    }
}

// let realm = new Realm({schema: [UserSchema, PlaceSchema, IoPortStatusSchema, ReportSchema],
//     schemaVersion: 1,
//     migration: function(oldRealm, newRealm){
//         newRealm.deleteAll();
//     }
// })
let realm = new Realm({schema: [UserSchema, PlaceSchema, IoPortStatusSchema, ReportSchema],
    schemaVersion: 1

})

export default realm;