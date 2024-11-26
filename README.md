# Cutscene Maker for Foundry VTT

A module for creating and managing cutscenes in Foundry Virtual Tabletop (VTT). This module allows Game Masters to create complex cutscenes with camera movements, scene transitions, token animations, and more, enhancing the storytelling experience.
This module requires the Advanced Macros and Socketlib Modules in order to play the cutscene for all users. Once you export your script and save it as a macro be sure to set it to execute for All Players or Everyone But Me, whichever applies for your use case.

These modules can be found at:
https://github.com/mclemente/fvtt-advanced-macros
https://github.com/manuelVo/foundryvtt-socketlib

These are marked as required dependencies and will try to automatically install if not already installed.

## Features

- **Camera Control**: Pan and zoom the camera to specific positions.
- **Scene Transitions**: Switch between scenes seamlessly.
- **Token Movement**: Move tokens to specified positions with animations.
- **Token Say**: Make tokens say specific messages in chat.
- **Play Audio**: Play audio files during the cutscene.
- **Door State Control**: Open, close, or lock doors.
- **Wait Actions**: Pause the cutscene for specified durations.
- **Tile Movement**: Move tiles to specified positions.
- **Screen Effects**: Add screen flashes and shakes for dramatic effect.
- **Macro Execution**: Run Foundry macros during cutscenes.
- **Image Display**: Show images during the cutscene.
- **Fade Effects**: Fade the screen in or out over a specified duration.
- **UI Control**: Hide or show the user interface.
- **Show/Hide Tokens**: Toggle the visibility of tokens.

## Installation

1. Download the module from the [releases page](https://github.com/cyelis1224/CM4Foundry/releases) or install directly via Foundry VTT using this module.json URL: https://raw.githubusercontent.com/cyelis1224/cutscene-maker/main/module.json.
2. Extract the module files to your `Data/modules` directory.
3. Enable the module in your Foundry VTT game settings.

## Usage

1. **Open the Cutscene Maker**: Click on the Cutscene Maker button in the scene controls.
2. **Create a Cutscene**: Use the unified menu to add actions to your cutscene.
   - **Camera Control**: Add camera movements and zoom actions.
   - **Scene Transitions**: Specify scenes to switch to during the cutscene.
   - **Token Movement**: Define token movements and rotations.
   - **Token Say**: Make tokens say specific messages in chat.
   - **Play Audio**: Play audio files during the cutscene.
   - **Door State Control**: Open, close, or lock doors.
   - **Wait Actions**: Pause the cutscene for a set duration.
   - **Tile Movement**: Move tiles to specified positions.
   - **Screen Effects**: Add screen flashes and shakes.
   - **Macro Execution**: Run specific macros at points in the cutscene.
   - **Image Display**: Show specific images.
   - **Fade Effects**: Fade the screen in or out over a specified duration.
   - **UI Control**: Hide or show the user interface.
   - **Show/Hide Tokens**: Toggle the visibility of tokens.
3. **Test Run**: Click the "Test Run" button to preview your cutscene. The Cutscene Maker window will minimize and restore automatically after the test run.
4. **Export**: Save your cutscene script for later use.
5. **Import**: Use the import feature to load previously saved cutscene scripts. Simply paste the script into the import dialog and click "Import" to reconstruct the actions.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or suggestions, feel free to reach out:

- **Email**: althomas731@example.com
- **GitHub Issues**: [https://github.com/cyelis1224/cutscene-maker/issues](https://github.com/cyelis1224/cutscene-maker/issues)

## Acknowledgements

- Thanks to the Foundry VTT community for their support suggestions!

