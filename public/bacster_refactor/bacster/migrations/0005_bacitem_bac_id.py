# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bacster', '0004_bacitem_confidence'),
    ]

    operations = [
        migrations.AddField(
            model_name='bacitem',
            name='bac_id',
            field=models.CharField(max_length=150, null=True, blank=True),
            preserve_default=True,
        ),
    ]
