import { Router } from 'express';
import { Controller } from './controller';

export function opentoolRoutes(controller: Controller): Router {
  const router = Router();
  
  router.get('/version', (req, res) => controller.getVersion(req, res));
  router.post('/call', (req, res) => controller.call(req, res));
  router.get('/load', (req, res) => controller.load(req, res));
  
  return router;
}