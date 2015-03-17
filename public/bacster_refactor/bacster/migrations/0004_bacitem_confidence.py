# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bacster', '0003_genome_length'),
    ]

    operations = [
        migrations.AddField(
            model_name='bacitem',
            name='confidence',
            field=models.CharField(max_length=50, null=True, blank=True),
            preserve_default=True,
        ),
    ]
