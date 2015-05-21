# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bacster', '0007_session_manager'),
    ]

    operations = [
        migrations.AddField(
            model_name='bacset',
            name='organism',
            field=models.ForeignKey(default=1, to='bacster.Organism'),
            preserve_default=True,
        ),
    ]