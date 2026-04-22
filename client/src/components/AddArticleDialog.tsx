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
import { articleApi } from "@/api/article";
import type { CreateArticleParams } from "@/api/types";

interface AddArticleDialogProps {
  onSuccess?: () => void;
}

export function AddArticleDialog({ onSuccess }: AddArticleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
    tag: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "请填写必填项",
        description: "标题和内容不能为空",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const tags = formData.tag
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const briefContent = formData.content.slice(0, 30);

      const params: CreateArticleParams = {
        title: formData.title,
        content: formData.content,
        briefContent,
        image: formData.image || "",
        tag: tags,
        author: "王建国",
        contentCount: formData.content.length,
      };

      await articleApi.create(params);

      toast({
        title: "创建成功",
        description: "文章已成功创建",
      });

      setOpen(false);
      setFormData({
        title: "",
        content: "",
        image: "",
        tag: "",
      });

      onSuccess?.();
    } catch (error) {
      console.error("创建文章失败:", error);
      toast({
        title: "创建失败",
        description: "创建文章时发生错误，请稍后重试",
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
          新增文章
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-black/80 backdrop-blur-md border border-primary/30 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary font-pixel text-xl">
            新增文章
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label
              htmlFor="title"
              className="text-white font-medium text-base mb-2 block"
            >
              标题 *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="请输入文章标题"
              className="bg-black/40 border border-primary/50 focus:border-primary text-white placeholder:text-gray-400"
              required
            />
          </div>

          <div>
            <Label
              htmlFor="content"
              className="text-white font-medium text-base mb-2 block"
            >
              内容 *
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder="请输入文章内容"
              className="min-h-[200px] bg-black/40 border border-primary/50 focus:border-primary text-white placeholder:text-gray-400 resize-none"
              required
            />
          </div>

          <div>
            <Label
              htmlFor="image"
              className="text-white font-medium text-base mb-2 block"
            >
              封面图片
            </Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => handleInputChange("image", e.target.value)}
              placeholder="请输入图片URL地址"
              className="bg-black/40 border border-primary/50 focus:border-primary text-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <Label
              htmlFor="tag"
              className="text-white font-medium text-base mb-2 block"
            >
              标签
            </Label>
            <Input
              id="tag"
              value={formData.tag}
              onChange={(e) => handleInputChange("tag", e.target.value)}
              placeholder="请输入标签，多个标签用逗号分隔"
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
              创建文章
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
