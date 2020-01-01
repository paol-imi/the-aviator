/* --- Worlds --- */
const Worlds = [
    {
        // world name
        name: 'Beginners\' \nforest',
        // world colors
        colors: {
            // button hue
            hue: 225,
            // title color
            title: '#95ba6c',
            // courtain background
            background: ['#C1DE94', '#EBD293'],
            // blocks colors
            blocks: [
                '#AC555E', // dark brown
                '#788546', // dark green     
                '#D3F761', // light green
                '#68c3c0' // light blue
            ]
        },
        // stages
        stages: [
            {
                // level name
                name: 'start',
                // level description
                description: "Transport the blocks to the final position",
                // levels
                levels: [
                    {
                        // stage dimension
                        dimension: {
                            width: 7,
                            height: 3
                        },
                        // aviator
                        aviator: {
                            x: 5,
                            y: 1,
                            direction: 'right',
                            taken: undefined
                        },
                        // cells when stage starts
                        start: [{
                            // cell position
                            x: 4,
                            y: 1,
                            // cell blocks
                            // 0 => colors.blocks[0], 1 => colors.blocks[1]
                            blocks: [0, 1]
                        }],
                        // cells when stage finishes
                        end: [{
                            x: 1,
                            y: 1,
                            blocks: [1, 0]
                        }]
                    },
                    {
                        dimension: {
                            width: 7,
                            height: 3
                        },
                        aviator: {
                            x: 5,
                            y: 1,
                            direction: 'right',
                            taken: undefined
                        },
                        start: [{
                            x: 4,
                            y: 1,
                            blocks: [0, 1, 2, 3]
                        }],
                        end: [{
                            x: 1,
                            y: 1,
                            blocks: [3, 2, 1, 0]
                        }]
                    }
                ]
            },
            {
                name: 'Inverted',
                description: "Transport the blocks to the final position",
                levels: [{
                    dimension: {
                        width: 7,
                        height: 3
                    },
                    aviator: {
                        x: 5,
                        y: 1,
                        direction: 'right',
                        taken: undefined
                    },
                    start: [{
                        x: 4,
                        y: 1,
                        blocks: [0, 1]
                    }],
                    end: [{
                        x: 1,
                        y: 1,
                        blocks: [0, 1]
                    }]
                },
                {
                    dimension: {
                        width: 7,
                        height: 3
                    },
                    aviator: {
                        x: 5,
                        y: 1,
                        direction: 'right',
                        taken: undefined
                    },
                    start: [{
                        x: 4,
                        y: 1,
                        blocks: [0, 1, 2, 3]
                    }],
                    end: [{
                        x: 1,
                        y: 1,
                        blocks: [0, 1, 2, 3]
                    }]
                }
                ]
            },
            {
                name: 'Discards',
                description: "Transport the blocks to the final position",
                levels: [{
                    dimension: {
                        width: 7,
                        height: 3
                    },
                    aviator: {
                        x: 5,
                        y: 1,
                        direction: 'right',
                        taken: undefined
                    },
                    start: [{
                        x: 4,
                        y: 1,
                        blocks: [0, 0, 1]
                    }],
                    end: [{
                        x: 1,
                        y: 1,
                        blocks: [1]
                    }]
                },
                {
                    dimension: {
                        width: 7,
                        height: 3
                    },
                    aviator: {
                        x: 5,
                        y: 1,
                        direction: 'right',
                        taken: undefined
                    },
                    start: [{
                        x: 4,
                        y: 1,
                        blocks: [0, 1, 0, 0, 1]
                    }],
                    end: [{
                        x: 1,
                        y: 1,
                        blocks: [1, 1]
                    }]
                },
                {
                    dimension: {
                        width: 7,
                        height: 3
                    },
                    aviator: {
                        x: 5,
                        y: 1,
                        direction: 'right',
                        taken: undefined
                    },
                    start: [{
                        x: 4,
                        y: 1,
                        blocks: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]
                    }],
                    end: [{
                        x: 1,
                        y: 1,
                        blocks: [1, 1, 1, 1]
                    }]
                }
                ]
            },
            {
                name: 'Turn around',
                description: "Transport the blocks to the final position",
                levels: [{
                    dimension: {
                        width: 7,
                        height: 7
                    },
                    aviator: {
                        x: 2,
                        y: 3,
                        direction: 'left'
                    },
                    start: [{
                        x: 3,
                        y: 3,
                        blocks: [0, 1, 2, 3, 0, 1, 2, 3]
                    }],
                    end: [{
                        x: 3,
                        y: 0,
                        blocks: [2, 2]
                    },
                    {
                        x: 3,
                        y: 6,
                        blocks: [0, 0]
                    },
                    {
                        x: 0,
                        y: 3,
                        blocks: [1, 1]
                    },
                    {
                        x: 6,
                        y: 3,
                        blocks: [3, 3]
                    }
                    ],
                    holes: [
                        [0, 0],
                        [0, 1],
                        [1, 0],
                        [6, 0],
                        [6, 1],
                        [5, 0],
                        [6, 6],
                        [6, 5],
                        [5, 6],
                        [0, 6],
                        [0, 5],
                        [1, 6]
                    ]
                }]
            }
        ]
    },
    {
        name: 'Programmers\' farm',
        colors: {
            // bottons hue
            hue: 175,
            // title color
            title: '#d1b790',
            // background colors
            background: ['#E4E0BA', '#F7D9AA'],
            // block colors
            blocks: [
                '#f25346', // red
                '#F5986E', // pink     
                '#68c3c0', // light blue
                '#e4e0ba'  // light gray
            ]
        },
        stages: [
            {
                name: 'Labirint',
                description: "Transport the blocks to the final position",
                levels: [{
                    dimension: {
                        width: 5,
                        height: 6
                    },
                    aviator: {
                        x: 0,
                        y: 0,
                        direction: 'up',
                        taken: undefined
                    },
                    holes: [
                        [1, 0],
                        [1, 1],
                        [1, 2],
                        [1, 3],
                        [1, 4],
                        [2, 0],
                        [2, 1],
                        [2, 2],
                        [2, 3],
                        [2, 4],
                        [3, 0],
                        [3, 1],
                        [3, 2],
                        [3, 3],
                        [3, 4],
                        [4, 0],
                        [4, 1]
                    ],
                    start: [{
                        x: 0,
                        y: 5,
                        blocks: [0]
                    },
                    {
                        x: 4,
                        y: 5,
                        blocks: [0]
                    },
                    {
                        x: 4,
                        y: 3,
                        blocks: [1]
                    }
                    ],
                    end: [{
                        x: 4,
                        y: 2,
                        blocks: [1]
                    }]
                },
                {
                    dimension: {
                        width: 8,
                        height: 6
                    },
                    aviator: {
                        x: 0,
                        y: 0,
                        direction: 'up',
                        taken: undefined
                    },
                    holes: [
                        [1, 0],
                        [1, 1],
                        [1, 2],
                        [1, 3],
                        [1, 4],
                        [2, 4],
                        [3, 4],
                        [4, 4],
                        [5, 4],
                        [6, 4],
                        [6, 3],
                        [6, 2],
                        [6, 1],
                        [5, 1],
                        [4, 1],
                        [3, 1]
                    ],
                    start: [{
                        x: 0,
                        y: 5,
                        blocks: [0]
                    },
                    {
                        x: 7,
                        y: 5,
                        blocks: [0]
                    },
                    {
                        x: 7,
                        y: 0,
                        blocks: [0]
                    },
                    {
                        x: 2,
                        y: 0,
                        blocks: [0]
                    },
                    {
                        x: 2,
                        y: 3,
                        blocks: [0]
                    },
                    {
                        x: 5,
                        y: 3,
                        blocks: [0]
                    },
                    {
                        x: 5,
                        y: 2,
                        blocks: [0]
                    },
                    {
                        x: 4,
                        y: 2,
                        blocks: [1]
                    }
                    ],
                    end: [{
                        x: 3,
                        y: 2,
                        blocks: [1]
                    }]
                }
                ]
            },
            {
                name: 'Inline',
                description: "Transport the blocks to the final position",
                levels: [{
                    dimension: {
                        width: 5,
                        height: 4
                    },
                    aviator: {
                        x: 0,
                        y: 2,
                        direction: 'down',
                        taken: undefined
                    },
                    start: [{
                        x: 0,
                        y: 3,
                        blocks: [0, 2]
                    }],
                    end: [{
                        x: 0,
                        y: 0,
                        blocks: [2]
                    },
                    {
                        x: 1,
                        y: 0,
                        blocks: [0]
                    }
                    ]
                },
                {
                    dimension: {
                        width: 5,
                        height: 4
                    },
                    aviator: {
                        x: 0,
                        y: 2,
                        direction: 'down',
                        taken: undefined
                    },
                    start: [{
                        x: 0,
                        y: 3,
                        blocks: [0, 1, 2, 3]
                    }],
                    end: [{
                        x: 0,
                        y: 0,
                        blocks: [3]
                    },
                    {
                        x: 1,
                        y: 0,
                        blocks: [2]
                    },
                    {
                        x: 2,
                        y: 0,
                        blocks: [1]
                    },
                    {
                        x: 3,
                        y: 0,
                        blocks: [0]
                    }
                    ]
                }
                ]
            },
            {
                name: 'Follow the way',
                description: "Transport the blocks to the final position",
                levels: [{
                    dimension: {
                        width: 7,
                        height: 7
                    },
                    aviator: {
                        x: 1,
                        y: 0,
                        direction: 'up',
                        taken: undefined
                    },
                    start: [{
                        x: 1,
                        y: 1,
                        blocks: [0]
                    },
                    {
                        x: 1,
                        y: 2,
                        blocks: [0]
                    },
                    {
                        x: 1,
                        y: 3,
                        blocks: [0]
                    },
                    {
                        x: 2,
                        y: 3,
                        blocks: [0]
                    },
                    {
                        x: 3,
                        y: 3,
                        blocks: [0]
                    },
                    {
                        x: 3,
                        y: 2,
                        blocks: [0]
                    },
                    {
                        x: 3,
                        y: 1,
                        blocks: [0]
                    },
                    {
                        x: 4,
                        y: 1,
                        blocks: [0]
                    },
                    {
                        x: 5,
                        y: 1,
                        blocks: [0]
                    },
                    {
                        x: 5,
                        y: 2,
                        blocks: [0]
                    },
                    {
                        x: 5,
                        y: 3,
                        blocks: [0]
                    },
                    {
                        x: 5,
                        y: 4,
                        blocks: [0]
                    },
                    {
                        x: 5,
                        y: 5,
                        blocks: [0]
                    },
                    {
                        x: 4,
                        y: 5,
                        blocks: [0]
                    },
                    {
                        x: 3,
                        y: 5,
                        blocks: [0]
                    },
                    {
                        x: 2,
                        y: 5,
                        blocks: [1]
                    }
                    ],
                    end: [{
                        x: 1,
                        y: 5,
                        blocks: [1]
                    }]
                },
                {
                    dimension: {
                        width: 7,
                        height: 8
                    },
                    aviator: {
                        x: 0,
                        y: 1,
                        direction: 'left',
                        taken: undefined
                    },
                    start: [{
                        x: 1,
                        y: 1,
                        blocks: [0]
                    },
                    {
                        x: 2,
                        y: 1,
                        blocks: [0]
                    },
                    {
                        x: 3,
                        y: 1,
                        blocks: [0]
                    },
                    {
                        x: 4,
                        y: 1,
                        blocks: [0]
                    },
                    {
                        x: 5,
                        y: 1,
                        blocks: [0]
                    },
                    {
                        x: 5,
                        y: 2,
                        blocks: [0]
                    },
                    {
                        x: 5,
                        y: 3,
                        blocks: [0]
                    },
                    {
                        x: 5,
                        y: 4,
                        blocks: [0]
                    },
                    {
                        x: 5,
                        y: 5,
                        blocks: [0]
                    },
                    {
                        x: 5,
                        y: 6,
                        blocks: [0]
                    },
                    {
                        x: 4,
                        y: 6,
                        blocks: [0]
                    },
                    {
                        x: 3,
                        y: 6,
                        blocks: [0]
                    },
                    {
                        x: 3,
                        y: 5,
                        blocks: [0]
                    },
                    {
                        x: 3,
                        y: 4,
                        blocks: [0]
                    },
                    {
                        x: 3,
                        y: 3,
                        blocks: [0]
                    },
                    {
                        x: 2,
                        y: 3,
                        blocks: [0]
                    },
                    {
                        x: 1,
                        y: 3,
                        blocks: [0]
                    },
                    {
                        x: 1,
                        y: 4,
                        blocks: [0]
                    },
                    {
                        x: 1,
                        y: 5,
                        blocks: [1]
                    }],
                    end: [{
                        x: 1,
                        y: 6,
                        blocks: [1]
                    }]
                }
                ]
            },
            {
                name: 'Follow the way 2',
                description: "Transport the blocks to the final position",
                levels: [{
                    dimension: {
                        width: 7,
                        height: 7
                    },
                    aviator: {
                        x: 2,
                        y: 2,
                        direction: 'down',
                        taken: undefined
                    },
                    start: [{
                        x: 3,
                        y: 5,
                        blocks: [0]
                    },
                    {
                        x: 4,
                        y: 4,
                        blocks: [0]
                    },
                    {
                        x: 5,
                        y: 3,
                        blocks: [0]
                    },
                    {
                        x: 4,
                        y: 2,
                        blocks: [0]
                    },
                    {
                        x: 3,
                        y: 1,
                        blocks: [0]
                    },
                    {
                        x: 2,
                        y: 4,
                        blocks: [1]
                    }
                    ],
                    end: [{
                        x: 1,
                        y: 3,
                        blocks: [1]
                    }],
                    holes: [
                        [0, 0],
                        [0, 1],
                        [0, 6],
                        [0, 5],
                        [1, 0],
                        [6, 0],
                        [6, 1],
                        [5, 0],
                        [6, 5],
                        [6, 6],
                        [5, 6],
                        [7, 6],
                        [1, 6]
                    ]
                },
                {
                    dimension: {
                        width: 9,
                        height: 9
                    },
                    aviator: {
                        x: 2,
                        y: 2,
                        direction: 'left',
                        taken: undefined
                    },
                    start: [{
                        x: 3,
                        y: 3,
                        blocks: [0]
                    },
                    {
                        x: 4,
                        y: 2,
                        blocks: [0]
                    },
                    {
                        x: 5,
                        y: 1,
                        blocks: [0]
                    },
                    {
                        x: 6,
                        y: 2,
                        blocks: [0]
                    },
                    {
                        x: 7,
                        y: 3,
                        blocks: [0]
                    },
                    {
                        x: 6,
                        y: 4,
                        blocks: [0]
                    },
                    {
                        x: 5,
                        y: 5,
                        blocks: [0]
                    },
                    {
                        x: 4,
                        y: 6,
                        blocks: [0]
                    },
                    {
                        x: 3,
                        y: 7,
                        blocks: [0]
                    },
                    {
                        x: 2,
                        y: 6,
                        blocks: [1]
                    }
                    ],
                    end: [{
                        x: 1,
                        y: 5,
                        blocks: [1]
                    }],
                    holes: [
                        [0, 1],
                        [0, 0],
                        [0, 8],
                        [0, 7],
                        [1, 0],
                        [8, 0],
                        [8, 1],
                        [7, 0],
                        [8, 5],
                        [8, 6],
                        [8, 7],
                        [8, 8],
                        [7, 6],
                        [7, 7],
                        [7, 8],
                        [6, 7],
                        [6, 8],
                        [5, 8],
                        [1, 8]
                    ]
                }
                ]
            }
        ]
    },
    {
        name: 'Recursive volcano',
        colors: {
            hue: 330,
            title: 'whitesmoke',
            background: ['#AC575C', '#81CBC7'],
            blocks: [
                '#f25346', // red
                '#3398D0', // light blue
            ]
        },
        stages: [
            {
                name: 'Labirint 2',
                description: "Transport the blocks to the final position",
                levels: [{
                    dimension: {
                        width: 5,
                        height: 6
                    },
                    aviator: {
                        x: 0,
                        y: 1,
                        direction: 'up',
                        taken: undefined
                    },
                    holes: [
                        [1, 0],
                        [1, 1],
                        [1, 2],
                        [1, 3],
                        [1, 4],
                        [2, 0],
                        [2, 1],
                        [2, 2],
                        [2, 3],
                        [2, 4],
                        [3, 0],
                        [3, 1],
                        [3, 2],
                        [3, 3],
                        [3, 4],
                        [4, 0],
                        [4, 1],
                        [4, 2],
                    ],
                    start: [{
                        x: 0,
                        y: 5,
                        blocks: [0]
                    },
                    {
                        x: 4,
                        y: 5,
                        blocks: [0]
                    },
                    {
                        x: 4,
                        y: 3,
                        blocks: [1]
                    }
                    ],
                    end: [{
                        x: 0,
                        y: 0,
                        blocks: [1]
                    }]
                },
                {
                    dimension: {
                        width: 8,
                        height: 6
                    },
                    aviator: {
                        x: 0,
                        y: 1,
                        direction: 'up',
                        taken: undefined
                    },
                    holes: [
                        [1, 0],
                        [1, 1],
                        [1, 2],
                        [1, 3],
                        [1, 4],
                        [2, 4],
                        [3, 4],
                        [4, 4],
                        [5, 4],
                        [6, 4],
                        [6, 3],
                        [6, 2],
                        [6, 1],
                        [5, 1],
                        [4, 1],
                        [3, 1]
                    ],
                    start: [{
                        x: 0,
                        y: 5,
                        blocks: [0]
                    },
                    {
                        x: 7,
                        y: 5,
                        blocks: [0]
                    },
                    {
                        x: 7,
                        y: 0,
                        blocks: [0]
                    },
                    {
                        x: 2,
                        y: 0,
                        blocks: [0]
                    },
                    {
                        x: 2,
                        y: 3,
                        blocks: [0]
                    },
                    {
                        x: 5,
                        y: 3,
                        blocks: [0]
                    },
                    {
                        x: 5,
                        y: 2,
                        blocks: [0]
                    },
                    {
                        x: 3,
                        y: 2,
                        blocks: [1]
                    }
                    ],
                    end: [{
                        x: 0,
                        y: 0,
                        blocks: [1]
                    }]
                }
                ]
            },
            {
                name: 'Offset',
                description: "Transport the blocks to the final position",
                levels: [{
                    dimension: {
                        width: 3,
                        height: 7
                    },
                    aviator: {
                        x: 0,
                        y: 0,
                        direction: 'up',
                        taken: undefined
                    },
                    start: [{
                        x: 0,
                        y: 2,
                        blocks: [0]
                    },
                    {
                        x: 1,
                        y: 3,
                        blocks: [0]
                    },
                    {
                        x: 0,
                        y: 1,
                        blocks: [1]
                    },
                    {
                        x: 1,
                        y: 1,
                        blocks: [1]
                    }
                    ],
                    end: [{
                        x: 0,
                        y: 4,
                        blocks: [0]
                    },
                    {
                        x: 1,
                        y: 6,
                        blocks: [0]
                    }
                    ]
                },
                {
                    dimension: {
                        width: 5,
                        height: 7
                    },
                    aviator: {
                        x: 0,
                        y: 0,
                        direction: 'up',
                        taken: undefined
                    },
                    start: [{
                        x: 1,
                        y: 2,
                        blocks: [0]
                    },
                    {
                        x: 0,
                        y: 3,
                        blocks: [0]
                    },
                    {
                        x: 2,
                        y: 2,
                        blocks: [0]
                    },
                    {
                        x: 3,
                        y: 3,
                        blocks: [0]
                    },
                    {
                        x: 1,
                        y: 1,
                        blocks: [1]
                    },
                    {
                        x: 0,
                        y: 1,
                        blocks: [1]
                    },
                    {
                        x: 2,
                        y: 1,
                        blocks: [1]
                    },
                    {
                        x: 3,
                        y: 1,
                        blocks: [1]
                    }
                    ],
                    end: [{
                        x: 1,
                        y: 4,
                        blocks: [0]
                    },
                    {
                        x: 0,
                        y: 6,
                        blocks: [0]
                    },
                    {
                        x: 2,
                        y: 4,
                        blocks: [0]
                    },
                    {
                        x: 3,
                        y: 6,
                        blocks: [0]
                    }
                    ]
                },
                {
                    dimension: {
                        width: 2,
                        height: 9
                    },
                    aviator: {
                        x: 0,
                        y: 0,
                        direction: 'up',
                        taken: undefined
                    },
                    start: [{
                        x: 0,
                        y: 4,
                        blocks: [0]
                    },
                    {
                        x: 0,
                        y: 1,
                        blocks: [1]
                    }
                    ],
                    end: [{
                        x: 0,
                        y: 8,
                        blocks: [0]
                    }]
                }
                ]
            }
        ]
    },
    {
        name: 'Impossible ocean',
        colors: {
            hue: 340,
            title: '#7D669E',
            background: ['lightblue', '#f7d9aa'],
            blocks: [
                '#f7d9aa', // sand
                '#80E9E7', // light blue    
                '#7D669E' // violet
            ]
        },
        stages: [
            {
                name: 'Sum the way',
                description: "legend: <br>O - orange block<br>B - blue block<br>V - violet block<br>F - the final block (the translucent one)<br><br>There are some blue blocks between the 2 orange blocks.<br>The distance of the final block is equal to the sum of the value of all blue blocks.<br>The value of a blue block is given by its position (the first positon is after the orange block, the second one after the firts one and so on..)<br><br>Example:<br>_____F___<br>V________<br>_O_<n style='font-weight: bold'>B</n>_<n style='font-weight: bold'>B</n>O___<br>__1<n style='font-weight: bold'>2</n>3<n style='font-weight: bold'>4</n>____<br><br>the blue ones are in the second and in the fourth positon so the final block will be distant 2+4=6 blocks from the bottom",
                levels: [{
                    dimension: {
                        width: 3,
                        height: 7
                    },
                    aviator: {
                        x: 0,
                        y: 0,
                        direction: 'up',
                        taken: undefined
                    },
                    start: [{
                        x: 0,
                        y: 1,
                        blocks: [0]
                    },
                    {
                        x: 0,
                        y: 2,
                        blocks: [1]
                    },
                    {
                        x: 0,
                        y: 3,
                        blocks: [1]
                    },
                    {
                        x: 0,
                        y: 4,
                        blocks: [0]
                    },
                    {
                        x: 1,
                        y: 0,
                        blocks: [2]
                    }
                    ],
                    end: [{
                        x: 2,
                        y: 2,
                        blocks: [2]
                    }],
                },
                {
                    dimension: {
                        width: 3,
                        height: 12
                    },
                    aviator: {
                        x: 0,
                        y: 0,
                        direction: 'up',
                        taken: undefined
                    },
                    start: [{
                        x: 0,
                        y: 1,
                        blocks: [0]
                    },
                    {
                        x: 0,
                        y: 2,
                        blocks: [1]
                    },
                    {
                        x: 0,
                        y: 3,
                        blocks: [1]
                    },
                    {
                        x: 0,
                        y: 4,
                        blocks: [1]
                    },
                    {
                        x: 0,
                        y: 5,
                        blocks: [1]
                    },
                    {
                        x: 0,
                        y: 6,
                        blocks: [0]
                    },
                    {
                        x: 1,
                        y: 0,
                        blocks: [2]
                    }
                    ],
                    end: [{
                        x: 2,
                        y: 9,
                        blocks: [2]
                    }],
                },
                {
                    dimension: {
                        width: 3,
                        height: 10
                    },
                    aviator: {
                        x: 0,
                        y: 0,
                        direction: 'up',
                        taken: undefined
                    },
                    start: [{
                        x: 0,
                        y: 1,
                        blocks: [0]
                    },
                    {
                        x: 0,
                        y: 3,
                        blocks: [1]
                    },
                    {
                        x: 0,
                        y: 6,
                        blocks: [1]
                    },
                    {
                        x: 0,
                        y: 7,
                        blocks: [0]
                    },
                    {
                        x: 1,
                        y: 0,
                        blocks: [2]
                    }
                    ],
                    end: [{
                        x: 2,
                        y: 6,
                        blocks: [2]
                    }],
                },
                {
                    dimension: {
                        width: 3,
                        height: 12
                    },
                    aviator: {
                        x: 0,
                        y: 0,
                        direction: 'up',
                        taken: undefined
                    },
                    start: [{
                        x: 0,
                        y: 1,
                        blocks: [0]
                    },
                    {
                        x: 0,
                        y: 3,
                        blocks: [1]
                    },
                    {
                        x: 0,
                        y: 4,
                        blocks: [1]
                    },
                    {
                        x: 0,
                        y: 6,
                        blocks: [1]
                    },
                    {
                        x: 0,
                        y: 7,
                        blocks: [0]
                    },
                    {
                        x: 1,
                        y: 0,
                        blocks: [2]
                    }
                    ],
                    end: [{
                        x: 2,
                        y: 9,
                        blocks: [2]
                    }],
                },
                {
                    dimension: {
                        width: 3,
                        height: 9
                    },
                    aviator: {
                        x: 0,
                        y: 0,
                        direction: 'up',
                        taken: undefined
                    },
                    start: [{
                        x: 0,
                        y: 1,
                        blocks: [0]
                    },
                    {
                        x: 0,
                        y: 2,
                        blocks: [1]
                    },
                    {
                        x: 0,
                        y: 4,
                        blocks: [1]
                    },
                    {
                        x: 0,
                        y: 5,
                        blocks: [1]
                    },
                    {
                        x: 0,
                        y: 6,
                        blocks: [0]
                    },
                    {
                        x: 1,
                        y: 0,
                        blocks: [2]
                    }
                    ],
                    end: [{
                        x: 2,
                        y: 7,
                        blocks: [2]
                    }],
                }
                ]
            }
        ]
    }
]