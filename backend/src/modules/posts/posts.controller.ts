import type { Request, Response } from 'express';
import type { PostsService } from './posts.service';
import { listPostsSchema, postIdSchema } from './posts.dto';

export class PostsController {
  constructor(private readonly service: PostsService) {}

  list = async (req: Request, res: Response) => {
    const query = listPostsSchema.parse(req.query);
    const result = await this.service.list(query);
    return res.json(result);
  };

  detail = async (req: Request, res: Response) => {
    const { id } = postIdSchema.parse(req.params);
    const post = await this.service.getById(id);
    return res.json(post);
  };

  tags = async (_req: Request, res: Response) => {
    const tags = await this.service.listTags();
    return res.json({ data: tags });
  };
}
