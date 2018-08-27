exports.typeData = [
    'Web/New',
    'Denali/Update'
];

exports.user = {
    Susie: {
        name: 'Susie',
        password: '123',
        group : 'pm'
    },
    Edel: {
        name: 'Edel',
        password: '123',
        group : ''
    }
};

exports.workload = {
    'WS' : {
        'Assignee' : 300,
        'geo' : 500
    },
    'ISV' : {
        'Assignee' : 500,
        'CD' : 800
    }
};

exports.group = {
    'all' : [
            {title:"Category",show: true},
            {title:"Radar",show:true},
            {title:"Page_Name",show:true},
            {title:"Reference_URL",show:true},
            {title:"Geo_Locale_URL",show:true},
            {title:"Notes",show:true},
            {title:"WS_ID" ,show: true},
            {title:"WS_Task" ,show: true},
            {title:"Words_to_Translate",show: true},
            {title:"Words_to_Edit",show: true},
            {title:"Total_Words",show: true},
            {title:"Assignee",show: true},
            {title:"CD_Delegate",show: true},
            {title:"CD_Review",show: true},
            {title:"Type", show: true},
            {title:"Writer_ISV_Ready" ,show: true},
            {title:"Writer_ISV_Due_day" ,show: true},
            {title:"CD_ISV_Ready" ,show: true},
            {title:"CD_ISV_Due_day",show: true},
            {title:"CD_ISV_Approved" ,show: true},
            {title:"Art_CD_ISV_Ready",show: true},
            {title:"Art_CD_ISV_Due_day" ,show: true},
            {title:"XF_ISV_Ready" ,show: true},
            {title:"XF_ISV_Due_day",show : true},
            {title:"Graphic_Ready",show: true},
            {title:"Graphic_Due_day",show: true}
        ],
    'pm' : [
        {title:"Category",show: true},
        {title:"Radar",show: true},
        {title:"Page_Name", show:true},
        {title:"Reference_URL",show: true},
        {title:"Geo_Locale_URL",show: true},
        {title:"Notes",show:true},
        {title:"WS_ID" ,show: true},
        {title:"WS_Task" ,show: true},
        {title:"Words_to_Translate",show : true},
        {title:"Words_to_Edit",show: true},
        {title:"Total_Words",show: true},
        {title:"Assignee",show: true},
        {title:"CD_Delegate",show: true},
        {title:"CD_Review",show: true},
        {title:"Type", show: true},
        {title:"Writer_ISV_Ready" ,show: true},
        {title:"Writer_ISV_Due_day" ,show: true},
        {title:"CD_ISV_Ready" ,show: true},
        {title:"CD_ISV_Due_day",show: false},
        {title:"CD_ISV_Approved" ,show: true},
        {title:"Art_CD_ISV_Ready",show : true},
        {title:"Art_CD_ISV_Due_day" ,show: true},
        {title:"XF_ISV_Ready" ,show: true},
        {title:"XF_ISV_Due_day",show : true},
        {title:"Graphic_Ready",show : true},
        {title:"Graphic_Due_day",show : false}
    ],
};