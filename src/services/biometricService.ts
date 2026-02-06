import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

export const isBiometricAvailable = async () => {
  try {
    const { available } = await rnBiometrics.isSensorAvailable();
    return available;
  } catch (error) {
    console.error("Biometric availability check failed", error);
    return false;
  }
};

export const authenticateBiometric = async () => {
  try {
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: 'Unlock Expense Tracker',
      cancelButtonText: 'Cancel' // Important for Android
    });
    return success;
  } catch (error) {
    console.error("Biometric authentication failed", error);
    return false;
  }
};