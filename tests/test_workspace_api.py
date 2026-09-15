from tests.test_owner_isolation import OwnerIsolationTests
from unittest.mock import patch
import python_backend as portal


class WorkspaceApiTests(OwnerIsolationTests):
    def test_changed_input_cannot_regenerate_old_version(self):
        base = '/api/data-workspace/files/' + self.dataset['id']
        h = self.headers('owner')
        preview = self.client.request('POST', base+'/preview', h, json={'recipe':{}}).json()
        saved = self.client.request('POST', base+'/versions', h, json={
            'recipe':{}, 'confirmed':True, 'fingerprint':preview['fingerprint']})
        self.assertEqual(saved.status_code, 201)
        with patch.object(portal, 'load_analysis_rows', return_value=([{'cycle':1,'capacity':999}], {})):
            response = self.client.get(base+'/versions/'+saved.json()['id']+'/download', h)
        self.assertEqual(response.status_code, 409)

    def test_administrator_source_download_requires_second_confirmation(self):
        base = '/api/data-workspace/files/' + self.dataset['id']
        with patch.object(portal, 'raw_artifact_download_response') as download:
            result = self.client.get(base+'/download', self.headers('admin'))
            self.assertEqual(result.status_code, 403)
            download.assert_not_called()

    def test_initial_profile_requires_zero_revision(self):
        base = '/api/data-workspace/files/' + self.dataset['id']
        result = self.client.request('PUT', base+'/profile', self.headers('owner'),
                                     json={'profile':{'material':'LFP'},'revision':2})
        self.assertEqual(result.status_code, 409)

    def test_profile_revision_preview_and_saved_recipe_version(self):
        base = '/api/data-workspace/files/' + self.dataset['id']
        h = self.headers('owner')
        initial = self.client.request('PUT',base+'/profile',h,json={'profile':{'material':'LiFePO4','displayName':'My LFP'},'revision':0})
        self.assertEqual(initial.status_code,200)
        stale = self.client.request('PUT',base+'/profile',h,json={'profile':{'material':'NCM'},'revision':0})
        self.assertEqual(stale.status_code,409)
        recipe = {'dropEmpty':True,'column':'capacity','outputColumn':'scaled','factor':2,'unit':'test-unit'}
        preview = self.client.request('POST',base+'/preview',h,json={'recipe':recipe})
        self.assertEqual(preview.status_code,200)
        self.assertEqual(preview.json()['rows'][0]['scaled'],320)
        denied = self.client.request('POST',base+'/versions',h,json={'recipe':recipe})
        self.assertEqual(denied.status_code,400)
        saved = self.client.request('POST',base+'/versions',h,json={'recipe':recipe,'confirmed':True,'fingerprint':preview.json()['fingerprint']})
        self.assertEqual(saved.status_code,201)
        self.assertEqual(saved.json()['trainingStatus'],'not_authorized')
        versions = self.client.get(base+'/versions',h).json()
        self.assertEqual(len(versions),1)
        exported = self.client.get(base+'/versions/'+saved.json()['id']+'/download',h)
        self.assertEqual(exported.status_code,200)
        self.assertEqual(exported.json()['rows'][0]['scaled'],320)
        source = self.client.get('/api/datasets/'+self.dataset['id'],h).json()
        self.assertNotIn('scaled',source['rows'][0])

    def test_external_artifact_references_cannot_be_injected(self):
        response = self.client.request('POST','/api/datasets',self.headers('owner'),json={
            'dataType':'cyc','sourceName':'forged.csv','rows':[{'cycle':1,'capacity':1}],
            'rawArtifact':{'localPath':'foreign-secret'},'parsedArtifact':{'objectKey':'foreign-key'}})
        self.assertEqual(response.status_code,201)
        self.assertEqual(response.json()['rawArtifact'],{})
        self.assertEqual(response.json()['parsedArtifact'],{})

    def test_foreign_version_cannot_be_downloaded(self):
        route='/api/data-workspace/files/'+self.dataset['id']+'/versions/guessed/download'
        self.assertEqual(self.client.get(route,self.headers('outsider')).status_code,404)
