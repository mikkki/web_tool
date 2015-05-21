# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bacster', '0008_auto_20150520_2055'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bacset',
            name='organism',
            field=models.ForeignKey(default=1, to='bacster.Organism'),
            preserve_default=True,
        ),
    ]