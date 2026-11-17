package in.gov.tamilnilam.reports;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import androidx.core.app.NotificationCompat;
import androidx.core.content.FileProvider;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class WebAppInterface {
    private final MainActivity activity;
    private static final String CHANNEL_ID = "tamilnilam_downloads";

    public WebAppInterface(MainActivity activity) {
        this.activity = activity;
        createNotificationChannel();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Report Downloads";
            String description = "Notifications for downloaded reports and PDFs";
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            NotificationManager notificationManager = activity.getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    @JavascriptInterface
    public void showToast(String message) {
        activity.runOnUiThread(() -> Toast.makeText(activity, message, Toast.LENGTH_SHORT).show());
    }

    @JavascriptInterface
    public String getAppVersion() {
        return "1.0.0";
    }

    @JavascriptInterface
    public void saveBase64File(String base64Data, String mimeType, String filename) {
        if (base64Data == null || filename == null) return;

        activity.runOnUiThread(() -> {
            try {
                String cleanBase64 = base64Data;
                if (cleanBase64.contains(",")) {
                    cleanBase64 = cleanBase64.substring(cleanBase64.indexOf(",") + 1);
                }
                byte[] fileBytes = Base64.decode(cleanBase64, Base64.DEFAULT);

                Uri savedUri = null;
                File savedFile = null;

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Downloads.DISPLAY_NAME, filename);
                    values.put(MediaStore.Downloads.MIME_TYPE, mimeType);
                    values.put(MediaStore.Downloads.IS_PENDING, 1);

                    Uri collection = MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
                    savedUri = activity.getContentResolver().insert(collection, values);

                    if (savedUri != null) {
                        try (OutputStream os = activity.getContentResolver().openOutputStream(savedUri)) {
                            if (os != null) {
                                os.write(fileBytes);
                                os.flush();
                            }
                        }
                        values.clear();
                        values.put(MediaStore.Downloads.IS_PENDING, 0);
                        activity.getContentResolver().update(savedUri, values, null, null);
                    }
                } else {
                    File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                    if (!downloadsDir.exists()) downloadsDir.mkdirs();
                    savedFile = new File(downloadsDir, filename);
                    try (FileOutputStream fos = new FileOutputStream(savedFile)) {
                        fos.write(fileBytes);
                        fos.flush();
                    }
                    savedUri = FileProvider.getUriForFile(activity, activity.getPackageName() + ".fileprovider", savedFile);
                }

                Toast.makeText(activity, "Saved to Downloads: " + filename, Toast.LENGTH_LONG).show();

                // Fire notification and open intent
                showDownloadNotification(filename, mimeType, savedUri, savedFile);

            } catch (Exception e) {
                e.printStackTrace();
                Toast.makeText(activity, "Error saving file: " + e.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    private void showDownloadNotification(String filename, String mimeType, Uri uri, File file) {
        try {
            Intent viewIntent = new Intent(Intent.ACTION_VIEW);
            if (uri != null) {
                viewIntent.setDataAndType(uri, mimeType);
                viewIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            }

            PendingIntent pendingIntent = PendingIntent.getActivity(
                    activity,
                    (int) System.currentTimeMillis(),
                    viewIntent,
                    Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0
            );

            NotificationCompat.Builder builder = new NotificationCompat.Builder(activity, CHANNEL_ID)
                    .setSmallIcon(R.drawable.ic_launcher)
                    .setContentTitle("Download Complete")
                    .setContentText(filename)
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                    .setContentIntent(pendingIntent)
                    .setAutoCancel(true);

            NotificationManager notificationManager = (NotificationManager) activity.getSystemService(Context.NOTIFICATION_SERVICE);
            if (notificationManager != null) {
                notificationManager.notify((int) System.currentTimeMillis(), builder.build());
            }

            // Prompt user immediately to view file
            if (uri != null) {
                try {
                    activity.startActivity(Intent.createChooser(viewIntent, "Open " + filename));
                } catch (Exception ignored) {
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
