from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Vetmanagementsystem", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="patient",
            name="photo_data",
            field=models.TextField(blank=True, null=True),
        ),
    ]
