import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const useDocIdentifierMutation = (updateProductFormData, displayAlert) => useMutation(
  async (docIdentifierData) => {
    const { uploadFile, formData } = docIdentifierData;
    const response = await httpService.makeRequest(
      'post',
      `${window.env.PRODUCT_SERVICE_URL}upload_file/`,
      uploadFile,
      '',
      'multipart/form-data',
    );
    if (response && response.data) {
      let productFormData = formData;
      if (response.data.cloud_url && !_.isEmpty(response.data.cloud_url)) {
        const doc_file = productFormData.product_info.doc_file
          && !_.isEmpty(productFormData.product_info.doc_file)
          ? [...productFormData.product_info.doc_file, ...response.data.cloud_url]
          : response.data.cloud_url;
        productFormData = {
          ...productFormData,
          product_info: {
            ...formData.product_info,
            doc_file,
          },
        };
        updateProductFormData(productFormData);
      }
    }
  },
  {
    onError: () => {
      displayAlert('error', "Couldn't upload file");
    },
  },
);
