/* --- Inputs --- */
Blockly.Gamepad["INPUTS"] = {
  FORWARD: "0",
  RIGHT: "1",
  BACKWARD: "2",
  LEFT: "3",
};

/* --- Init --- */
Blockly.Gamepad.init({
  blocks: {
    move: {
      method: "MOVE",
      args: [
        {
          field: "DIRECTION",
          get: parseInt,
        },
      ],
      json: {
        message0: "Move %1",
        args0: [
          {
            type: "field_dropdown",
            name: "DIRECTION",
            options: [
              ["forward", Blockly.Gamepad["INPUTS"]["FORWARD"]],
              ["backward", Blockly.Gamepad["INPUTS"]["BACKWARD"]],
            ],
          },
        ],
        previousStatement: null,
        nextStatement: null,
        style: "move_blocks",
        tooltip: "Move the plane one step forward or backward",
        helpUrl: "https://paol-imi.github.io/the-aviator/tutorial/#/4",
      },
    },
    turn: {
      method: "TURN",
      args: [
        {
          field: "DIRECTION",
          get: parseInt,
        },
      ],
      json: {
        message0: "Turn %1",
        args0: [
          {
            type: "field_dropdown",
            name: "DIRECTION",
            options: [
              ["right ↻", Blockly.Gamepad["INPUTS"]["RIGHT"]],
              ["left ↺", Blockly.Gamepad["INPUTS"]["LEFT"]],
            ],
          },
        ],
        previousStatement: null,
        nextStatement: null,
        style: "move_blocks",
        tooltip: "Turn the plane right or left",
        helpUrl: "https://paol-imi.github.io/the-aviator/tutorial/#/5",
      },
    },
    take: {
      method: "TAKE",
      json: {
        message0: "take ✊",
        previousStatement: null,
        nextStatement: null,
        style: "action_blocks",
        tooltip: "Take the block under the plane",
        helpUrl: "https://paol-imi.github.io/the-aviator/tutorial/#/6",
      },
    },
    release: {
      method: "RELEASE",
      json: {
        message0: "release 🖐",
        previousStatement: null,
        nextStatement: null,
        style: "action_blocks",
        tooltip: "Release the block under the plane",
        helpUrl: "https://paol-imi.github.io/the-aviator/tutorial/#/7",
      },
    },
    taken: {
      method: "TAKEN",
      args: [
        {
          field: "colour",
          get: (colour) => colour.toLowerCase(),
        },
      ],
      order: Blockly.JavaScript.ORDER_NONE,
      json: {
        message0: "taken %1",
        args0: [
          {
            type: "field_colour",
            name: "colour",
            colour: JollyColor,
          },
        ],
        output: "Boolean",
        style: "logic_blocks",
        tooltip: "Is the block taken of the chosen color?",
        helpUrl: "https://paol-imi.github.io/the-aviator/tutorial/#/8",
      },
    },
    over: {
      method: "OVER",
      args: [
        {
          field: "colour",
          get: (colour) => colour.toLowerCase(),
        },
      ],
      order: Blockly.JavaScript.ORDER_NONE,
      json: {
        message0: "over %1",
        args0: [
          {
            type: "field_colour",
            name: "colour",
            colour: JollyColor,
          },
        ],
        output: "Boolean",
        style: "logic_blocks",
        tooltip: "Is the airplane over a block of the chosen color?",
        helpUrl: "https://paol-imi.github.io/the-aviator/tutorial/#/9",
      },
    },
  },
  wrap: [
    "procedures_defnoreturn",
    "procedures_defreturn",
    "procedures_callreturn",
    "procedures_callnoreturn",
    "procedures_ifreturn",
    "logic_boolean",
    "controls_if",
    "controls_whileUntil",
    "logic_negate",
  ],
  toolbox: ELEMENTS["GAME"]["TOOLBOX"],
});

/* --- Inject --- */
Blockly.inject("blockly-div", {
  toolbox: ELEMENTS["GAME"]["TOOLBOX"],
  toolboxPosition: "end",
  scrollbars: true,
  horizontalLayout: false,
  trashcan: false,
  theme: Blockly.Themes.Modern,
});

const gamepad = new Blockly.Gamepad({
    customHighlight: true,
    magicJson: true,
    start: true,
  }),
  gui = new Gui(),
  game = new Game(gamepad, gui);
