import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { projectApi } from "@/api/project";
import type { CreateProjectParams } from "@/api/types";

interface AddProjectDialogProps {
  onSuccess?: () => void;
}

export function AddProjectDialog({ onSuccess }: AddProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    gitUrl: "",
    stars: "",
    cover: "",
    demoUrl: "",
    tags: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "请填写必填项",
        description: "项目名称不能为空",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const params: CreateProjectParams = {
        name: formData.name,
        description: formData.description || "",
        gitUrl: formData.gitUrl || "",
        stars: formData.stars ? parseInt(formData.stars) : 0,
        cover: formData.cover || "",
        demoUrl: formData.demoUrl || "",
        tags,
      };

      await projectApi.create(params);

      toast({
        title: "创建成功",
        description: "项目已成功创建",
      });

      setOpen(false);
      setFormData({
        name: "",
        description: "",
        gitUrl: "",
        stars: "",
        cover: "",
        demoUrl: "",
        tags: "",
      });

      onSuccess?.();
    } catch (error) {
      console.error("创建项目失败:", error);
      toast({
        title: "创建失败",
        description: "创建项目时发生错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新增项目
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-black/80 backdrop-blur-md border border-primary/30 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary font-pixel text-xl">
            新增开源项目
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label
              htmlFor="name"
              className="text-white font-medium text-base mb-2 block"
            >
              项目名称 *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="请输入项目名称"
              className="bg-black/40 border border-primary/50 focus:border-primary text-white placeholder:text-gray-400"
              required
            />
          </div>

          <div>
            <Label
              htmlFor="description"
              className="text-white font-medium text-base mb-2 block"
            >
              项目描述
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="请输入项目描述"
              className="min-h-[100px] bg-black/40 border border-primary/50 focus:border-primary text-white placeholder:text-gray-400 resize-none"
            />
          </div>

          <div>
            <Label
              htmlFor="gitUrl"
              className="text-white font-medium text-base mb-2 block"
            >
              Git仓库地址
            </Label>
            <Input
              id="gitUrl"
              value={formData.gitUrl}
              onChange={(e) => handleInputChange("gitUrl", e.target.value)}
              placeholder="请输入Git仓库URL"
              className="bg-black/40 border border-primary/50 focus:border-primary text-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <Label
              htmlFor="demoUrl"
              className="text-white font-medium text-base mb-2 block"
            >
              演示地址
            </Label>
            <Input
              id="demoUrl"
              value={formData.demoUrl}
              onChange={(e) => handleInputChange("demoUrl", e.target.value)}
              placeholder="请输入演示地址URL"
              className="bg-black/40 border border-primary/50 focus:border-primary text-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <Label
              htmlFor="cover"
              className="text-white font-medium text-base mb-2 block"
            >
              封面图片
            </Label>
            <Input
              id="cover"
              value={formData.cover}
              onChange={(e) => handleInputChange("cover", e.target.value)}
              placeholder="请输入封面图片URL"
              className="bg-black/40 border border-primary/50 focus:border-primary text-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <Label
              htmlFor="stars"
              className="text-white font-medium text-base mb-2 block"
            >
              Star数量
            </Label>
            <Input
              id="stars"
              type="number"
              value={formData.stars}
              onChange={(e) => handleInputChange("stars", e.target.value)}
              placeholder="请输入Star数量"
              className="bg-black/40 border border-primary/50 focus:border-primary text-white placeholder:text-gray-400"
              min="0"
            />
          </div>

          <div>
            <Label
              htmlFor="tags"
              className="text-white font-medium text-base mb-2 block"
            >
              技术标签
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              placeholder="请输入技术标签，多个标签用逗号分隔"
              className="bg-black/40 border border-primary/50 focus:border-primary text-white placeholder:text-gray-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-primary/30">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="bg-black/40 border border-gray-500 text-gray-300 hover:bg-black/60 hover:border-gray-400"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-black border border-primary shadow-lg"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              创建项目
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
