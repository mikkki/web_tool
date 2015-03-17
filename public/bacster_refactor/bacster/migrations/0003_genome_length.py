# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bacster', '0002_bacitem'),
    ]

    operations = [
        migrations.AddField(
            model_name='genome',
            name='len',
            field=models.BigIntegerField(default=0),
            preserve_default=True,
        ),
    ]