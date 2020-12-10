import React, { useState, useContext } from 'react';
import { css } from '@emotion/react';
import Router, { useRouter } from 'next/router';
import FileUploader from 'react-firebase-file-uploader';
import Layout from '../components/layout/Layout';
import { Formulario, Campo, InputSubmit, Error } from '../components/ui/Formulario';

import { FirebaseContext } from '../firebase';

// Validaciones
import  useValidacion from '../hooks/useValidacion';
import  validarCrearProducto  from '../validacion/validarCrearProducto';
import { unstable_renderSubtreeIntoContainer } from 'react-dom';

const STATE_INICIAL = {
    nombre: '',
    empresa: '',
   // imagen: '',
    url: '',
    descripcion: ''
}

const NuevoProducto = () => {

    // state de las imagenes

    const [nombreimagen, guardarNombre] = useState('');
    const [subiendo, guardarSubiendo] = useState(false);
    const [progreso, guardarProgreso] = useState(0);
    const [urlimagen, guardarUrlImagen] = useState('');

    const [ error, guardarError] = useState(false);
    const [ image, setImage] = useState(null);

    const { valores, errores, submitForm, handleSubmit, handleChange, handleBlur } = useValidacion(STATE_INICIAL, validarCrearProducto, crearCuenta);

    const { nombre, empresa, imagen, url, descripcion} = valores;

    // hook de routing para redireccionar
    const router = useRouter();

    // context con las operaciones crud de firebase
    const { usuario, firebase } = useContext(FirebaseContext);

    const handleFile = e => {
        if(e.target.files[0]) {
            console.log(e.target.files[0])
            setImage(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        const uploadTask = await firebase.storage.ref(`productos/${image.lastModified}${image.name}`).put(image);
        const downloadURL = await uploadTask.ref.getDownloadURL();
        return downloadURL
      }
    

    async function crearCuenta() {
     
          // si el usuario no esta autenticado llevar al login
          if( !usuario) {
              return router.push('/login');
          }

          // crear el objeto de nuevo producto
          const producto = {
              nombre,
              empresa,
              url,
              urlimagen: await handleUpload(),
              descripcion,
              votos: 0,
              comentarios: [],
              creado: Date.now()
          }
        
          // insertarlo en la base de datos
          await firebase.db.collection('productos').add(producto);
    }


  return (

      <div>
          <Layout>
              <>
                <h1
                    css={css`
                        text-align: center;
                         margin-top: 5rem;
                    `}
                >Nuevo Producto</h1>
                <Formulario
                    onSubmit={handleSubmit}
                    noValidate
                >

                <fieldset>
                    <legend>Informacion General</legend>
                
                    <Campo>
                        <label htmlFor="nombre">Nombre</label>
                        <input 
                            type="text"
                            id="nombre"
                            placeholder="Tu Nombre"
                            name="nombre"
                            value={nombre}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                    </Campo>

                    {errores.nombre && <Error> {errores.nombre} </Error> } 


                    <Campo>
                        <label htmlFor="empresa">Empresa</label>
                        <input 
                            type="text"
                            id="empresa"
                            placeholder="Nombre Empresa o compañia"
                            name="empresa"
                            value={empresa}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                    </Campo>

                    {errores.empresa && <Error> {errores.empresa} </Error> } 

                    <Campo>
                    <label htmlFor="imagen">Imagen</label>
                        <input 
                            type="file"
                            accept="image/*"
                            id="imagen"
                            name="imagen"
                            onInput={ e => handleFile(e)}
                            
                        />
                    </Campo>

                    <Campo>
                        <label htmlFor="url">Url</label>
                        <input 
                            type="url"
                            id="url"
                            name="url"
                            placeholder="Url de tu producto"
                            value={url}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                    </Campo>

                    {errores.url && <Error> {errores.url} </Error> } 

                    {error && <Error>{error}</Error>}
                </fieldset>


                <fieldset>
                    <legend>Sobre tu producto</legend>

                    <Campo>
                    <label htmlFor="descripcion">Descripcion</label>
                    <textarea 
                        id="descripcion"
                        name="descripcion"
                        value={descripcion}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                </Campo>

                    {errores.descripcion && <Error> {errores.descripcion} </Error> } 

                </fieldset>

                    {error && <Error>{error}</Error>}

                    <InputSubmit 
                        type="submit"
                        value="Crear Producto"
                    />
                </Formulario>
              </>
          </Layout>

      </div>
  )
}
 
export default NuevoProducto;