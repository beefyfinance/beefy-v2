export const checkClipboardPermissions = async () => {
  try {
    // Check if clipboard permissions are granted
    if (navigator.permissions && navigator.permissions.query) {
      const permissionStatus = await navigator.permissions.query({
        name: 'clipboard-read' as PermissionName,
      });

      if (permissionStatus.state === 'denied') {
        console.error('Clipboard permission denied');
        return false;
      }

      if (permissionStatus.state === 'prompt') {
        // Request permission
        const newPermissionStatus = await navigator.permissions.query({
          name: 'clipboard-read' as PermissionName,
        });
        if (newPermissionStatus.state === 'denied') {
          console.error('Clipboard permission denied after request');
          return false;
        }
      }
    }
    return true;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};
