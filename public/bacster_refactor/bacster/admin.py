from django.contrib import admin
from bacster.models import *

class BacItemAdmin(admin.ModelAdmin):
    list_display = ('bacset', 'feature_id', 'seqid', 'source', 'feature_type', 'start', 'end', 'score',  \
                                                                               'confidence', 'bacid')
    search_fields = ('bacset__label', 'feature_id', 'seqid', 'source', 'feature_type', 'start', 'end', 'score', \
                                                                               'confidence', 'bacid')

    ordering = ('bacset__label', 'feature_id', 'seqid', 'start', 'end')

#ToDo: Exclude session fields from the admin add/edit forms:
admin.site.register(Session)
admin.site.register(Organism)
admin.site.register(Genome)
admin.site.register(BacSet)
admin.site.register(TargetType)
admin.site.register(Target)
admin.site.register(Bac)
admin.site.register(BacSession)
admin.site.register(BacItem, BacItemAdmin)
# Register your models here.
