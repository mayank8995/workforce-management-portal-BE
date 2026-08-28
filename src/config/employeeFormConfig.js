const projectFields = [
  {
    name: 'projectName',
    label: 'Project Name',
    type: 'primitive',
    fieldType: 'text',

    constraints: {
      required: true,
      minLength: 1,
    },

    options: [],

    defaultValue: '',

    metadata: {},
  },

  {
    name: 'status',
    label: 'Status',
    type: 'primitive',
    fieldType: 'select',

    constraints: {
      required: true,
    },

    options: [
      { label: 'Active', value: 'Active' },
      { label: 'Support', value: 'Support' },
      { label: 'On Hold', value: 'On Hold' },
      { label: 'Completed', value: 'Completed' },
    ],

    defaultValue: 'Active',

    metadata: {},
  },

  {
    name: 'riskStatus',
    label: 'Risk Status',
    type: 'primitive',
    fieldType: 'select',

    constraints: {
      required: true,
    },

    options: [
      { label: 'On Track', value: 'On Track' },
      { label: 'At Risk', value: 'At Risk' },
      { label: 'Delayed', value: 'Delayed' },
    ],

    defaultValue: 'On Track',

    metadata: {},
  },

  {
    name: 'priorityRanking',
    label: 'Priority Ranking',
    type: 'primitive',
    fieldType: 'number',

    constraints: {
      required: true,
      min: 1,
    },

    options: [],

    defaultValue: 1,

    metadata: {},
  },
];

const employeeForm = [
  {
    fieldType: 'section',
    label: 'Basic Information',

    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'primitive',
        fieldType: 'text',

        constraints: {
          required: true,
          minLength: 3,
        },

        options: [],

        defaultValue: '',

        metadata: {},
      },

      {
        name: 'email',
        label: 'Email',
        type: 'primitive',
        fieldType: 'text',

        constraints: {
          required: true,
          format: 'email',
        },

        options: [],

        defaultValue: '',

        metadata: {},
      },

      {
        name: 'phone',
        label: 'Phone',
        type: 'primitive',
        fieldType: 'text',

        constraints: {
          required: true,
          minLength: 10,
          maxLength: 10,
        },

        options: [],

        defaultValue: '',

        metadata: {},
      },

      {
        name: 'location',
        label: 'Location',
        type: 'primitive',
        fieldType: 'text',

        constraints: {
          required: true,
        },

        options: [],

        defaultValue: '',

        metadata: {},
      },
    ],
  },

  {
    fieldType: 'section',
    label: 'Work Information',

    fields: [
      {
        name: 'department',
        label: 'Department',
        type: 'primitive',
        fieldType: 'text',

        constraints: {
          required: true,
        },

        options: [],

        defaultValue: '',

        metadata: {},
      },

      {
        name: 'designation',
        label: 'Designation',
        type: 'primitive',
        fieldType: 'text',

        constraints: {
          required: true,
        },

        options: [],

        defaultValue: '',

        metadata: {},
      },

      {
        name: 'manager',
        label: 'Manager',
        type: 'primitive',
        fieldType: 'text',

        constraints: {
          required: true,
        },

        options: [],

        defaultValue: '',

        metadata: {},
      },

      {
        name: 'joiningDate',
        label: 'Joining Date',
        type: 'primitive',
        fieldType: 'date',

        constraints: {
          required: true,
        },

        options: [],

        defaultValue: '',

        metadata: {},
      },

      {
        name: 'yearsOfExperience',
        label: 'Years of Experience',
        type: 'primitive',
        fieldType: 'number',

        constraints: {
          required: true,
          min: 0,
        },

        options: [],

        defaultValue: 0,

        metadata: {},
      },

      {
        name: 'salary',
        label: 'Salary',
        type: 'primitive',
        fieldType: 'number',

        constraints: {
          required: true,
          min: 0,
        },

        options: [],

        defaultValue: 0,

        metadata: {},
      },

      {
        name: 'workMode',
        label: 'Work Mode',
        type: 'primitive',
        fieldType: 'select',

        constraints: {
          required: true,
        },

        options: [
          { label: 'Remote', value: 'Remote' },
          { label: 'Hybrid', value: 'Hybrid' },
          { label: 'Onsite', value: 'Onsite' },
        ],

        defaultValue: 'Remote',

        metadata: {},
      },
    ],
  },

  {
    fieldType: 'section',
    label: 'Projects',

    fields: [
      {
        fieldType: 'subsection',
        repeatable: true,
        name: 'projects',
        label: 'Project',
        fields: [
          {
            name: 'projectName',
            label: 'Project Name',
            type: 'primitive',
            fieldType: 'text',

            constraints: {
              required: true,
            },

            options: [],

            defaultValue: '',

            metadata: {},
          },

          {
            name: 'status',
            label: 'Status',
            type: 'primitive',
            fieldType: 'select',

            constraints: {
              required: true,
            },

            options: [
              { label: 'Active', value: 'Active' },
              { label: 'Support', value: 'Support' },
              { label: 'On Hold', value: 'On Hold' },
              { label: 'Completed', value: 'Completed' },
            ],

            defaultValue: 'Active',

            metadata: {},
          },

          {
            name: 'riskStatus',
            label: 'Risk Status',
            type: 'primitive',
            fieldType: 'select',

            constraints: {
              required: true,
            },

            options: [
              { label: 'On Track', value: 'On Track' },
              { label: 'At Risk', value: 'At Risk' },
              { label: 'Delayed', value: 'Delayed' },
            ],

            defaultValue: 'On Track',

            metadata: {},
          },

          {
            name: 'priorityRanking',
            label: 'Priority Ranking',
            type: 'primitive',
            fieldType: 'number',

            constraints: {
              required: true,
              min: 1,
            },

            options: [],

            defaultValue: 1,

            metadata: {},
          },
        ],
      },
    ],
  },
  {
    fieldType: 'section',
    label: 'Skills',
    fields: [
      {
        name: 'skills',
        label: 'Skills',
        type: 'primitive',
        controller: true,
        fieldType: 'text',
        constraints: {
          required: true,
          minLength: 1,
        },
        options: [],
        defaultValue: '',
        metadata: {
          message: 'Enter skills separated by commas.',
        },
      },
    ],
  },
  {
    fieldType: 'section',
    label: 'Performance',

    fields: [
      {
        name: 'rating',
        label: 'Rating',
        type: 'primitive',
        fieldType: 'number',

        constraints: {
          required: true,
          min: 0,
          max: 5,
        },

        options: [],

        defaultValue: 0,

        metadata: {},
      },

      {
        name: 'attendancePercentage',
        label: 'Attendance Percentage',
        type: 'primitive',
        fieldType: 'number',

        constraints: {
          required: true,
          min: 0,
          max: 100,
        },

        options: [],

        defaultValue: 0,

        metadata: {},
      },

      {
        name: 'employeeSatisfaction',
        label: 'Employee Satisfaction',
        type: 'primitive',
        fieldType: 'select',

        constraints: {
          required: true,
        },

        options: [
          { label: 'Low', value: 'Low' },
          { label: 'Medium', value: 'Medium' },
          { label: 'High', value: 'High' },
        ],

        defaultValue: 'Medium',

        metadata: {},
      },

      {
        name: 'onNoticePeriod',
        label: 'On Notice Period',
        type: 'primitive',
        fieldType: 'checkbox',

        constraints: {
          required: true,
        },

        options: [],

        defaultValue: false,

        metadata: {},
      },
    ],
  },
];

module.exports = { employeeForm };
