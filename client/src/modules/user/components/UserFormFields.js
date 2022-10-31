import React from 'react'

const UserFormFields = {
    "General": [{
        type: "text",
        label: "Name",
        name: "name",
        placeholder: "Enter User name",
        required: true
    }, {
        type: "text",
        label: "Email",
        name: "email",
        placeholder: "Enter User email",
        required: true
    }, {
        type: "text",
        label: "TnL Id",
        name: "tnl_id",
        placeholder: "Enter User TnL Id"
    }, {
        type: "text",
        label: "Contact",
        name: "contact",
        placeholder: "Enter User contact"
    }, {
        type: "date",
        label: "DOJ",
        name: "doj",
        formatter: 'formatDOJ'
    }, {
        type: "byjus_combobox",
        label: "Location",
        name: "location",
        model: "City",
        filter: {},
        displayKey: "city",
        valueKey: "city"
    }, {
        type: "byjus_combobox",
        label: "Status",
        name: "status",
        model: "status",
        options: [
            { label: 'Active', value: 'active' },
            { label: 'Left', value: 'left' },
            { label: 'Campaign Training', value: 'campaign_training' },
            { label: 'Non Sales', value: 'non_sales' }
        ]
    }],
    "Department Structure": [{
        type: "select",
        label: "Department",
        name: "department",
        model: "Department",
        filter: {},
        displayKey: "name",
        valueKey: "_id"
    }, {
        type: "select",
        label: "Sub Department",
        name: "subDepartment",
        model: "SubDepartment",
        filterKeys: ["department"],
        displayKey: "name",
        valueKey: "_id"
    }, {
        type: "byjus_combobox",
        label: "Unit",
        name: "unit",
        model: "Unit",
        filterKeys: ["department", "sub_department"],
        displayKey: "unit",
        valueKey: "unit"
    }, {
        type: "byjus_combobox",
        label: "Vertical",
        name: "vertical",
        model: "Vertical",
        filterKeys: ["department", "sub_department", "unit"],
        displayKey: "vertical",
        valueKey: "vertical"
    }, {
        type: "byjus_combobox",
        label: "Campaign",
        name: "campaign",
        model: "Campaign",
        filterKeys: ["department", "sub_department", "unit", "vertical"],
        displayKey: "campaign",
        valueKey: "campaign"
    }, {
        type: "byjus_combobox",
        label: "Role",
        name: "role",
        model: "Role",
        filterKeys: ["department"],
        displayKey: "name",
        valueKey: "_id",
        loadByDefault: false
    },
    ],
    "Reporting To": [],
    "Permission Mapping": [{
        type: "byjus_combobox",
        label: "Permission Template",
        name: "permission_template",
        model: "PermissionTemplate",
        isMulti: true,
        filter: {},
        displayKey: "name",
        valueKey: "_id"
    }]
}

export default UserFormFields