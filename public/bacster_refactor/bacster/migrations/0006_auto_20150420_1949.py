# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bacster', '0005_bacitem_bac_id'),
    ]

    operations = [
        migrations.RenameField(
            model_name='bacitem',
            old_name='bac_id',
            new_name='bacid',
        ),
    ]
