# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bacster', '0006_auto_20150420_1949'),
    ]

    operations = [
        migrations.AddField(
            model_name='session',
            name='manager',
            field=models.SmallIntegerField(default=0, max_length=1),
            preserve_default=True,
        ),
    ]
