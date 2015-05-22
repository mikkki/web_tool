# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Bac',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='BacSession',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('bac', models.ForeignKey(to='bacster.Bac')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='BacSet',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('label', models.CharField(max_length=150)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Genome',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('label', models.CharField(max_length=150)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Organism',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('label', models.CharField(max_length=150)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Session',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('pioneer_id', models.CharField(max_length=50)),
                ('notes', models.CharField(max_length=150)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Target',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('seq', models.TextField()),
                ('coords', models.CharField(max_length=50)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='TargetType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('label', models.CharField(max_length=50)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='target',
            name='targettype',
            field=models.ForeignKey(to='bacster.TargetType'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='genome',
            name='organism',
            field=models.ForeignKey(to='bacster.Organism'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='bacset',
            name='genome',
            field=models.ForeignKey(to='bacster.Genome'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='bacsession',
            name='session',
            field=models.ForeignKey(to='bacster.Session'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='bac',
            name='bacset',
            field=models.ForeignKey(to='bacster.BacSet'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='bac',
            name='target',
            field=models.ForeignKey(to='bacster.Target'),
            preserve_default=True,
        ),
    ]
