import { PermissionsAndroid, Platform } from 'react-native';

export const ensureStoragePermission = async (): Promise<boolean> => {
  // iOS doesn't need this
  if (Platform.OS !== 'android') return true;

  // Android 13+ (API 33+) doesn't need storage permission for Downloads
  if (Platform.Version >= 33) return true;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'Storage permission is required to export files',
        buttonPositive: 'Allow',
      }
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.log('Permission error:', error);
    return false;
  }
};
