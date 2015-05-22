# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bacster', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='BacItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('feature_id', models.CharField(max_length=150)),
                ('seqid', models.CharField(max_length=150)),
                ('source', models.CharField(max_length=150)),
                ('feature_type', models.CharField(max_length=150)),
                ('start', models.CharField(max_length=50)),
                ('end', models.CharField(max_length=50)),
                ('score', models.DecimalField(max_digits=16, decimal_places=6)),
                ('strand', models.CharField(max_length=1, choices=[(b'+', b'+'), (b'-', b'-')])),
                ('bacset', models.ForeignKey(to='bacster.BacSet')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
